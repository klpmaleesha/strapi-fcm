'use strict';

const { initializeApp, cert, applicationDefault, deleteApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { createHash } = require('node:crypto');
const { validateNotification, validateToken, badRequest, pagination } = require('../utils/validation');
const TOKEN_UID = 'plugin::strapi-fcm.token';
const HISTORY_UID = 'plugin::strapi-fcm.notification';
const INVALID_TOKENS = new Set(['messaging/registration-token-not-registered', 'messaging/invalid-registration-token']);

module.exports = ({ strapi }) => {
  const store = () => strapi.store({ environment: '', type: 'plugin', name: 'strapi-fcm' });
  const options = () => strapi.config.get('plugin.strapi-fcm', {});
  const rawConfig = async () => (await store().get({ key: 'config' })) || {};
  let app;
  let appKey;
  let queue = Promise.resolve();
  // Serialize sends with credential rotation so an active Firebase app is never deleted mid-send.
  const exclusive = (operation) => {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  };
  const publicConfig = (config) => ({
    cloud: config.cloud || '', preset: config.preset || '',
    created: Boolean(options().serviceAccount || options().useApplicationDefault || config.sdk),
    managedCredentials: Boolean(options().serviceAccount || options().useApplicationDefault),
  });
  const messaging = async () => {
    const config = await rawConfig();
    const sdk = options().serviceAccount || (options().useApplicationDefault ? undefined : config.sdk);
    if (!sdk && !options().useApplicationDefault) {
      const error = new Error('Configure Firebase credentials before sending notifications.');
      error.status = 409;
      throw error;
    }
    // Re-read persisted credentials so rotation also reaches other running Strapi instances.
    const key = createHash('sha256').update(JSON.stringify(sdk || { applicationDefault: true })).digest('hex');
    if (app && appKey !== key) { await deleteApp(app); app = undefined; }
    if (!app) {
      app = initializeApp({ credential: sdk ? cert(sdk) : applicationDefault() }, 'strapi-fcm');
      appKey = key;
    }
    return getMessaging(app);
  };
  return {
    async getConfig() {
      return { config: publicConfig(await rawConfig()), message: 'found' };
    },
    setConfig(input) {
      return exclusive(async () => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) badRequest('Invalid configuration.');
        const config = { ...await rawConfig() };
        for (const field of ['cloud', 'preset']) {
          if (input[field] !== undefined) {
            if (typeof input[field] !== 'string' || input[field].length > 128) badRequest(`Invalid ${field}.`);
            config[field] = input[field].trim();
          }
        }
        if (Boolean(config.cloud) !== Boolean(config.preset)) badRequest('Provide both Cloudinary fields, or leave both empty.');
        if (config.cloud && !/^[a-zA-Z0-9_-]+$/.test(config.cloud)) badRequest('Invalid Cloudinary cloud name.');
        if (input.sdk !== undefined) {
          const sdk = input.sdk;
          if (!sdk || typeof sdk !== 'object' || Array.isArray(sdk) ||
              typeof sdk.project_id !== 'string' || !sdk.project_id.trim() ||
              typeof sdk.client_email !== 'string' || !sdk.client_email.includes('@') ||
              typeof sdk.private_key !== 'string') badRequest('Upload a valid Firebase service account JSON file.');
          try { cert(sdk); } catch { badRequest('The Firebase service account private key is invalid.'); }
          config.sdk = { project_id: sdk.project_id, client_email: sdk.client_email, private_key: sdk.private_key };
        }
        if (!publicConfig(config).created) badRequest('Firebase credentials are required.');
        config.created = true;
        if (app) { await deleteApp(app); app = undefined; }
        await store().set({ key: 'config', value: config });
        return { config: publicConfig(config), message: 'saved' };
      });
    },
    sendNotification(input) {
      return exclusive(async () => {
        const { message, tokens, dryRun } = validateNotification(input);
        const client = await messaging();
        const response = { successCount: 0, failureCount: 0, recipientCount: 0, removedTokenCount: 0, errors: {} };
        let entry = null;
        const history = strapi.db.query(HISTORY_UID);
        const tokenQuery = strapi.db.query(TOKEN_UID);
        if (!dryRun) entry = await history.create({ data: {
          title: message.notification.title, body: message.notification.body,
          image: message.notification.imageUrl || null,
          target: message.topic ? 'topic' : tokens ? 'tokens' : 'all',
          topic: message.topic || null, status: 'sending',
        } });
        try {
          if (message.topic) {
            await client.send(message, dryRun);
            response.successCount = 1;
            response.recipientCount = 1;
          } else {
            const seen = new Set();
            const sendBatch = async (batch) => {
              if (!batch.length) return;
              const result = await client.sendEachForMulticast({ ...message, tokens: batch }, dryRun);
              response.successCount += result.successCount;
              response.failureCount += result.failureCount;
              response.recipientCount += batch.length;
              const invalid = [];
              result.responses.forEach((item, index) => {
                if (item.success) return;
                const code = item.error?.code || 'messaging/unknown-error';
                response.errors[code] = (response.errors[code] || 0) + 1;
                if (INVALID_TOKENS.has(code)) invalid.push(batch[index]);
              });
              // Do not prune tokens on test sends or ambiguous payload errors.
              if (!dryRun && invalid.length) {
                const removed = await tokenQuery.deleteMany({ where: { token: { $in: invalid } } });
                response.removedTokenCount += removed.count;
              }
            };
            if (tokens) {
              for (let offset = 0; offset < tokens.length; offset += 500) await sendBatch(tokens.slice(offset, offset + 500));
            } else {
              // Freeze the upper boundary; newly registered devices join the next broadcast.
              const last = await tokenQuery.findOne({ select: ['id'], orderBy: { id: 'desc' } });
              let cursor = 0;
              while (last && cursor < last.id) {
                const rows = await tokenQuery.findMany({
                  select: ['id', 'token'], where: { id: { $gt: cursor, $lte: last.id } },
                  orderBy: { id: 'asc' }, limit: 500,
                });
                if (!rows.length) break;
                cursor = rows[rows.length - 1].id;
                const batch = [];
                for (const row of rows) {
                  if (typeof row.token === 'string' && row.token.trim() && !seen.has(row.token.trim())) {
                    seen.add(row.token.trim()); batch.push(row.token.trim());
                  }
                }
                await sendBatch(batch);
              }
            }
          }
          const status = !response.recipientCount ? 'empty' : !response.failureCount ? 'sent' : response.successCount ? 'partial' : 'failed';
          if (entry) entry = await history.update({ where: { id: entry.id }, data: {
            status, successCount: response.successCount, failureCount: response.failureCount, recipientCount: response.recipientCount,
          } });
          return { response, entry, dryRun, status };
        } catch (error) {
          if (entry) await history.update({ where: { id: entry.id }, data: {
            status: 'failed', successCount: response.successCount,
            failureCount: response.failureCount, recipientCount: response.recipientCount,
          } }).catch(() => strapi.log.error('Strapi FCM could not update notification history.'));
          // Never automatically retry a broadcast that may already have reached devices.
          throw error;
        }
      });
    },
    async getNotifications(query = {}) {
      const { page, pageSize, offset } = pagination(query);
      const repository = strapi.db.query(HISTORY_UID);
      const [results, total] = await Promise.all([
        repository.findMany({
          select: ['id', 'title', 'body', 'image', 'createdAt', 'status', 'target', 'topic', 'successCount', 'failureCount', 'recipientCount'],
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], offset, limit: pageSize,
        }), repository.count(),
      ]);
      return { results, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
    },
    async addToken(input) {
      const token = validateToken(input?.token);
      const repository = strapi.db.query(TOKEN_UID);
      if (!await repository.findOne({ where: { token } })) {
        // The unique constraint also protects simultaneous registrations across instances.
        try { await repository.create({ data: { token } }); }
        catch (error) { if (!await repository.findOne({ where: { token } })) throw error; }
      }
      return { registered: true };
    },
    destroy() {
      return exclusive(async () => { if (app) { await deleteApp(app); app = undefined; } });
    },
  };
};
