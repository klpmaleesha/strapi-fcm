'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
test('published entry loads with the real Firebase SDK and validates a service account without network calls', async () => {
  const plugin = require('../strapi-server');
  assert.equal(typeof plugin.services.service, 'function');
  assert.equal(typeof plugin.controllers.controller, 'function');
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
  let saved;
  const strapi = { config: { get: () => ({}) }, store: () => ({ get: async () => saved, set: async ({ value }) => { saved = value; } }) };
  const service = plugin.services.service({ strapi });
  const result = await service.setConfig({ sdk: { project_id: 'local-test-only', client_email: 'test@example.com', private_key: privateKey } });
  assert.equal(result.config.created, true);
  assert.ok(!JSON.stringify(result).includes(privateKey));
  const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
  const { getMessaging } = require('firebase-admin/messaging');
  const app = initializeApp({ credential: cert(saved.sdk) }, 'strapi-fcm-runtime-smoke');
  try { assert.equal(typeof getMessaging(app).sendEachForMulticast, 'function'); }
  finally { await deleteApp(app); }
});
