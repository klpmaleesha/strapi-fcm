'use strict';
const Module = require('node:module');

function harness({ size = 0, saved, options = {}, failure, failureAt = Infinity } = {}) {
  let config = saved;
  let rows = Array.from({ length: size }, (_, i) => ({ id: i + 1, token: `demo-device-${i + 1}` }));
  const records = [];
  const batches = [];
  const apps = new Map();
  const deletedApps = [];
  const client = {
    async sendEachForMulticast(message, dryRun) {
      batches.push({ message, dryRun });
      if (batches.length === failureAt) throw Object.assign(new Error('Simulated Firebase transport outage'), { code: 'messaging/server-unavailable' });
      const responses = message.tokens.map((token) => {
        const code = failure?.(token);
        return code ? { success: false, error: { code } } : { success: true, messageId: `demo/${token}` };
      });
      return { responses, successCount: responses.filter((r) => r.success).length, failureCount: responses.filter((r) => !r.success).length };
    },
    async send(message, dryRun) { batches.push({ message, dryRun }); return 'demo/topic-message'; },
  };
  const tokens = {
    async findOne(query = {}) {
      if (query.where?.token) return rows.find((r) => r.token === query.where.token) || null;
      return [...rows].sort((a, b) => b.id - a.id)[0] || null;
    },
    async findMany({ where, limit } = {}) {
      return rows.filter((r) => !where || (r.id > where.id.$gt && r.id <= where.id.$lte)).sort((a,b) => a.id - b.id).slice(0, limit);
    },
    async create({ data }) {
      if (rows.some((r) => r.token === data.token)) throw new Error('unique token constraint');
      const row = { id: Math.max(0, ...rows.map((r) => r.id)) + 1, ...data };
      rows.push(row); return row;
    },
    async deleteMany({ where }) {
      const before = rows.length;
      rows = rows.filter((r) => !where.token.$in.includes(r.token));
      return { count: before - rows.length };
    },
  };
  const history = {
    async create({ data }) { const row = { id: records.length + 1, createdAt: new Date().toISOString(), ...data }; records.push(row); return { ...row }; },
    async update({ where, data }) { const row = records.find((r) => r.id === where.id); Object.assign(row, data); return { ...row }; },
    async findMany({ offset = 0, limit = 25 }) { return [...records].reverse().slice(offset, offset + limit); },
    async count() { return records.length; },
  };
  const strapi = {
    config: { get: (key, fallback) => key === 'plugin.strapi-fcm' ? options : key === 'plugin.strapi-fcm.registrationRateLimit' ? options.registrationRateLimit || fallback : fallback },
    store: () => ({ get: async () => config, set: async ({ value }) => { config = value; } }),
    db: { query: (uid) => uid.endsWith('.token') ? tokens : history },
    log: { error() {} },
    plugin: () => ({ service: () => service }),
  };
  const sdk = {
    initializeApp(config, name) { if (apps.has(name)) throw new Error('duplicate app'); const app = { name, config }; apps.set(name, app); return app; },
    cert(value) { if (value.private_key === 'invalid') throw new Error('invalid PEM'); return { ...value }; },
    applicationDefault: () => ({ demo: true }),
    deleteApp: async (app) => { apps.delete(app.name); deletedApps.push(app); },
  };
  // Only the local demo/test process substitutes Firebase; production imports the real SDK.
  const original = Module._load;
  const source = require.resolve('../../server/services/service');
  delete require.cache[source];
  let factory;
  try {
    Module._load = function (request, ...args) {
      if (request === 'firebase-admin/app') return sdk;
      if (request === 'firebase-admin/messaging') return { getMessaging: () => client };
      return original.call(this, request, ...args);
    };
    factory = require(source);
  } finally { Module._load = original; }
  const service = factory({ strapi });
  return { service, strapi, tokens, history, records, batches, apps, deletedApps, get rows() { return rows; }, get config() { return config; } };
}
module.exports = { harness };
