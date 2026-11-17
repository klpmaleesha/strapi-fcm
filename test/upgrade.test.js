'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { planCleanup, prepare } = require('../scripts/prepare-upgrade.cjs');
test('upgrade preserves draft settings so Strapi does not delete older unpublished plugin rows', () => {
  // Strapi 4 deletes unpublished rows before schema sync when draft/publish changes from true to false.
  for (const type of ['token', 'notification']) {
    const schema = require(`../server/content-types/${type}/schema.json`);
    assert.equal(schema.options.draftAndPublish, true);
  }
});
test('upgrade keeps the oldest valid token, trims it and removes collisions before updates', () => {
  const plan = planCleanup([{ id: 1, token: ' shared ' }, { id: 2, token: 'shared' }, { id: 3, token: '' }, { id: 4, token: null }, { id: 5, token: 'bad token' }, { id: 6, token: 'x'.repeat(256) }, { id: 7, token: 'unique' }]);
  assert.deepEqual(plan, { remove: [2,3,4,5,6], trim: [{ id: 1, token: 'shared' }], remaining: 2 });
});
test('upgrade report is read-only and apply runs delete then trim inside a transaction', async () => {
  const calls = [];
  const rows = [{ id: 1, token: ' shared ' }, { id: 2, token: 'shared' }];
  const db = () => ({ select() { return this; }, orderBy: async () => rows,
    whereIn: (_key, ids) => ({ delete: async () => calls.push(['delete', ids]) }),
    where: ({ id }) => ({ update: async ({ token }) => calls.push(['update', id, token]) }),
  });
  db.transaction = async (work) => { calls.push('transaction'); return work(db); };
  assert.deepEqual(await prepare(db), { mode: 'report-only', scanned: 2, remove: 1, trim: 1, remaining: 1 });
  assert.deepEqual(calls, []);
  await prepare(db, { apply: true });
  assert.deepEqual(calls, ['transaction', ['delete',[2]], ['update',1,'shared']]);
  await assert.rejects(prepare(db, { table: 'tokens; DROP TABLE tokens' }), /simple token table/);
});
