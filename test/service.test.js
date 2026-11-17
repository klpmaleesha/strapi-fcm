'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./support/harness.cjs');
const { validateNotification, validateToken } = require('../server/utils/validation');
const input = { title: 'Product update', body: 'Your new dashboard is ready.' };
const configured = { useApplicationDefault: true };

test('fresh install returns a usable config and never exposes stored private credentials', async () => {
  const fresh = harness();
  assert.equal((await fresh.service.getConfig()).config.created, false);
  const h = harness({ saved: { sdk: { private_key: 'SECRET' }, cloud: 'images', preset: 'public' } });
  const result = await h.service.getConfig();
  assert.equal(result.config.created, true);
  assert.ok(!JSON.stringify(result).includes('SECRET'));
});
test('rejects sending without credentials before creating history', async () => {
  const h = harness();
  await assert.rejects(h.service.sendNotification(input), { status: 409 });
  assert.equal(h.records.length, 0);
});
test('broadcasts over 500 devices, deduplicates old rows and returns the persisted history entry', async () => {
  const h = harness({ size: 1204, options: configured });
  h.rows.push({ id: 1205, token: 'demo-device-1' });
  const result = await h.service.sendNotification({ ...input, image: 'https://example.com/image.png' });
  assert.deepEqual(h.batches.map((b) => b.message.tokens.length), [500, 500, 204]);
  assert.equal(h.batches[0].message.notification.imageUrl, 'https://example.com/image.png');
  assert.equal(result.response.successCount, 1204);
  assert.equal(result.entry.status, 'sent');
  assert.equal(result.entry.id, 1);
  assert.equal(h.apps.size, 1);
});
test('cleans only definitively invalid tokens and records partial results', async () => {
  const h = harness({ size: 3, options: configured, failure: (token) => token.endsWith('1') ? 'messaging/registration-token-not-registered' : token.endsWith('2') ? 'messaging/invalid-argument' : undefined });
  const result = await h.service.sendNotification(input);
  assert.equal(result.status, 'partial');
  assert.equal(result.response.successCount, 1);
  assert.equal(result.response.failureCount, 2);
  assert.equal(result.response.removedTokenCount, 1);
  assert.deepEqual(h.rows.map((r) => r.token), ['demo-device-2', 'demo-device-3']);
  assert.ok(!JSON.stringify(result).includes('demo-device-1'));
});
test('dry run neither stores history nor removes expired tokens', async () => {
  const h = harness({ size: 1, options: configured, failure: () => 'messaging/registration-token-not-registered' });
  const result = await h.service.sendNotification({ ...input, dryRun: true });
  assert.equal(h.batches[0].dryRun, true);
  assert.equal(h.rows.length, 1);
  assert.equal(h.records.length, 0);
  assert.equal(result.entry, null);
});
test('targets supplied devices or topics without broadcasting to the database', async () => {
  const h = harness({ size: 20, options: configured });
  await h.service.sendNotification({ ...input, tokens: ['one', 'one', 'two'], data: { screen: 'news' } });
  assert.deepEqual(h.batches[0].message.tokens, ['one', 'two']);
  assert.deepEqual(h.batches[0].message.data, { screen: 'news' });
  await h.service.sendNotification({ ...input, topic: 'news' });
  assert.equal(h.batches[1].message.topic, 'news');
  assert.equal(h.records[1].target, 'topic');
});
test('empty audience succeeds explicitly without calling Firebase', async () => {
  const h = harness({ options: configured });
  const result = await h.service.sendNotification(input);
  assert.equal(result.status, 'empty');
  assert.equal(result.response.recipientCount, 0);
  assert.equal(h.batches.length, 0);
});
test('transport errors preserve counts from earlier batches, mark failure and never retry', async () => {
  const h = harness({ size: 1001, options: configured, failureAt: 2 });
  await assert.rejects(h.service.sendNotification(input), /outage/);
  assert.equal(h.records[0].status, 'failed');
  assert.equal(h.records[0].successCount, 500);
  assert.equal(h.batches.length, 2);
  // A failed send must not poison the credential/send queue.
  assert.equal((await h.service.sendNotification({ ...input, tokens: ['new-device'] })).status, 'sent');
});
test('repeat and concurrent token registration is idempotent and does not disclose tokens', async () => {
  const h = harness();
  const results = await Promise.all(Array.from({ length: 8 }, () => h.service.addToken({ token: ' shared-token ' })));
  assert.equal(h.rows.length, 1);
  assert.deepEqual(results[0], { registered: true });
  await assert.rejects(h.service.addToken({ token: '' }), { status: 400 });
});
test('rotation retains existing keys on partial updates, resets only the plugin Firebase app', async () => {
  const h = harness({ saved: { sdk: { project_id: 'old', private_key: 'old-secret', client_email: 'old@example.com' } } });
  await h.service.sendNotification({ ...input, tokens: ['test-device'] });
  const result = await h.service.setConfig({ cloud: 'images', preset: 'unsigned' });
  assert.equal(h.config.sdk.private_key, 'old-secret');
  assert.equal(h.deletedApps.length, 1);
  assert.ok(!JSON.stringify(result).includes('old-secret'));
  await h.service.setConfig({ sdk: { project_id: 'new', private_key: 'new-secret', client_email: 'new@example.com' } });
  await h.service.sendNotification({ ...input, tokens: ['test-device'] });
  assert.equal(h.apps.get('strapi-fcm').config.credential.project_id, 'new');
  await h.service.destroy();
  assert.equal(h.apps.size, 0);
});
test('malformed configs do not overwrite saved credentials', async () => {
  const h = harness({ saved: { sdk: { private_key: 'saved' } } });
  for (const bad of [{ cloud: 'images' }, { sdk: {} }, { sdk: { project_id: 'x', client_email: 'x@y', private_key: 'invalid' } }]) {
    await assert.rejects(h.service.setConfig(bad), { status: 400 });
  }
  assert.equal(h.config.sdk.private_key, 'saved');
});
test('server-managed application default credentials override an old stored service account', async () => {
  const h = harness({ options: configured, saved: { sdk: { project_id: 'old', private_key: 'old-secret' } } });
  await h.service.sendNotification({ ...input, tokens: ['device'] });
  assert.deepEqual(h.apps.get('strapi-fcm').config.credential, { demo: true });
});
test('credential rotation from another running instance is applied before the next send', async () => {
  const h = harness({ saved: { sdk: { project_id: 'old', private_key: 'old-secret' } } });
  await h.service.sendNotification({ ...input, tokens: ['device'] });
  h.config.sdk = { project_id: 'new', private_key: 'new-secret' };
  await h.service.sendNotification({ ...input, tokens: ['device'] });
  assert.equal(h.apps.get('strapi-fcm').config.credential.project_id, 'new');
  assert.equal(h.deletedApps.length, 1);
});
test('history is bounded, sorted, paginated and uses createdAt', async () => {
  const h = harness({ options: configured });
  for (let i = 0; i < 3; i++) await h.service.sendNotification({ ...input, tokens: ['device'] });
  const result = await h.service.getNotifications({ page: '2', pageSize: '2' });
  assert.deepEqual(result.results.map((r) => r.id), [1]);
  assert.deepEqual(result.pagination, { page: 2, pageSize: 2, total: 3, pageCount: 2 });
  await assert.rejects(h.service.getNotifications({ pageSize: 1000 }), { status: 400 });
});
test('rejects malformed or oversized payloads before sending', () => {
  for (const bad of [null, {}, { ...input, title: ' ' }, { ...input, body: 2 }, { ...input, image: 'http://example.com' }, { ...input, data: { value: 2 } }, { ...input, tokens: [] }, { ...input, topic: '/topics/news' }, { ...input, topic: 'news', tokens: ['x'] }, { ...input, dryRun: 'true' }, { ...input, data: { 'google.test': 'x' } }, { ...input, body: '🦊'.repeat(1000) }]) {
    assert.throws(() => validateNotification(bad), { status: 400 });
  }
  for (const bad of [null, {}, 'has spaces', 'a'.repeat(256)]) assert.throws(() => validateToken(bad), { status: 400 });
});
