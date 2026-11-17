'use strict';
// Run from the Strapi project directory. JSON: {"client":"better-sqlite3","connection":{"filename":"/absolute/path/data.db"},"useNullAsDefault":true}
// PostgreSQL/MySQL may use their normal Knex connection configuration. Never commit that file.
const fs = require('node:fs');

function planCleanup(rows) {
  const seen = new Set();
  const remove = [];
  const trim = [];
  for (const row of rows) {
    const token = typeof row.token === 'string' ? row.token.trim() : '';
    if (!token || token.length > 255 || /\s/.test(token) || seen.has(token)) remove.push(row.id);
    else { seen.add(token); if (token !== row.token) trim.push({ id: row.id, token }); }
  }
  return { remove, trim, remaining: seen.size };
}

async function prepare(database, { table = 'tokens', apply = false } = {}) {
  if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error('Use a simple token table name.');
  const work = async (db) => {
    const rows = await db(table).select('id', 'token').orderBy('id', 'asc');
    const plan = planCleanup(rows);
    if (apply) {
      // Remove collisions before trimming, including databases that already have a unique index.
      for (let offset = 0; offset < plan.remove.length; offset += 500) await db(table).whereIn('id', plan.remove.slice(offset, offset + 500)).delete();
      for (const row of plan.trim) await db(table).where({ id: row.id }).update({ token: row.token });
    }
    return { mode: apply ? 'applied' : 'report-only', scanned: rows.length, remove: plan.remove.length, trim: plan.trim.length, remaining: plan.remaining };
  };
  return apply ? database.transaction(work) : work(database);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0] || args.some((arg, index) => index > 0 && arg !== '--apply')) throw new Error('Usage: node prepare-upgrade.cjs /absolute/path/database-config.json [--apply]');
  const { table = 'tokens', ...config } = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  const knex = require(require.resolve('knex', { paths: [process.cwd()] }));
  const database = knex(config);
  try { console.log(JSON.stringify(await prepare(database, { table, apply: args.includes('--apply') }), null, 2)); }
  finally { await database.destroy(); }
}
if (require.main === module) main().catch((error) => {
  console.error(error.message.startsWith('Usage:') ? error.message : 'Preparation failed. Verify the database configuration and driver in your Strapi project. No token values are printed.');
  process.exitCode = 1;
});
module.exports = { planCleanup, prepare };
