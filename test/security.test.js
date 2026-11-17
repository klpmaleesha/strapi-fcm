'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
test('send, history and configuration routes enforce admin permissions', () => {
  const routes = require('../server/routes').admin;
  assert.equal(routes.type, 'admin');
  for (const route of routes.routes.filter((r) => r.path !== '/users/tokens')) {
    assert.notEqual(route.config.auth, false);
    assert.ok(route.config.policies.includes('admin::isAuthenticatedAdmin'));
    assert.equal(route.config.policies[1].name, 'admin::hasPermissions');
    assert.match(route.config.policies[1].config.actions[0], /^plugin::strapi-fcm\.(read|send|configure)$/);
  }
  assert.deepEqual(routes.routes.find((r) => r.path === '/users/tokens').config.middlewares, ['plugin::strapi-fcm.registration-limit']);
});
test('controllers return failure status codes without exposing internal errors or credentials', async () => {
  const errors = [];
  const factory = require('../server/controllers/controller');
  const controller = factory({ strapi: { plugin: () => ({ service: () => ({ sendNotification: async () => { throw new Error('SECRET firebase key'); } }) }), log: { error: (...args) => errors.push(args) } } });
  const ctx = { request: { body: {} } };
  await controller.sendNotifications(ctx);
  assert.equal(ctx.status, 502);
  assert.ok(!JSON.stringify(ctx.body).includes('SECRET'));
  assert.ok(!JSON.stringify(errors).includes('SECRET'));
});
test('public registration throttles per IP and permits other clients', async () => {
  const middleware = require('../server/middlewares/registration-limit')({}, { strapi: { config: { get: () => ({ windowMs: 60000, max: 2 }) } } });
  let accepted = 0;
  const ctx = { ip: '127.0.0.1', set(key, value) { this[key] = value; } };
  for (let i = 0; i < 3; i++) await middleware(ctx, async () => { accepted++; });
  assert.equal(accepted, 2);
  assert.equal(ctx.status, 429);
  assert.equal(ctx['Retry-After'], '60');
  await middleware({ ip: '127.0.0.2' }, async () => { accepted++; });
  assert.equal(accepted, 3);
});
