'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const { harness } = require('../test/support/harness.cjs');
const controllerFactory = require('../server/controllers/controller');
const root = path.resolve(__dirname, '..');
const uiModules = path.join(root, '.qa/ui/node_modules');
const realUI = process.env.REAL_STRAPI_UI !== '0' && fs.existsSync(path.join(uiModules, '@strapi/design-system'));
const port = Number(process.env.PORT || 4173);
let h;
let controller;
function reset(scenario) {
  h = harness({ size: scenario === 'empty' ? 0 : 1204, options: { useApplicationDefault: true },
    saved: { cloud: 'demo-cloud', preset: 'demo-unsigned' },
    failureAt: scenario === 'outage' ? 1 : Infinity,
    failure: scenario === 'mixed' ? (token) => token === 'demo-device-1200' ? 'messaging/registration-token-not-registered' : ['demo-device-4', 'demo-device-7'].includes(token) ? 'messaging/server-unavailable' : undefined : undefined,
  });
  controller = controllerFactory({ strapi: h.strapi });
}
reset('mixed');
async function main() {
  const bundle = await build({ absWorkingDir: root, entryPoints: ['demo/app.jsx'], bundle: true, write: false,
    loader: { '.js': 'jsx' },
    alias: { react: path.join(root, 'node_modules/react'), 'react-dom': path.join(root, 'node_modules/react-dom') },
    define: { 'process.env.REAL_STRAPI_UI': JSON.stringify(realUI ? '1' : '0'), 'process.env.STRAPI_ADMIN_BACKEND_URL': '""', 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'local-strapi-shell', setup(build) {
      build.onResolve({ filter: /^demo-theme$/ }, () => ({ path: path.join(__dirname, realUI ? 'theme.jsx' : 'simple-theme.jsx') }));
      build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: path.join(uiModules, 'react-router-dom/index.js') }));
      build.onResolve({ filter: /^@strapi\/design-system(?:\/.*)?$/ }, (args) => ({ path: realUI
        ? path.join(uiModules, '@strapi/design-system/dist', args.path.replace('@strapi/design-system', '').replace(/^\//, ''), 'index.mjs')
        : path.join(__dirname, 'design-system.jsx') }));
      build.onResolve({ filter: /^@strapi\/helper-plugin$/ }, () => ({ path: path.join(__dirname, 'helper-plugin.jsx') }));
      build.onResolve({ filter: /uploadImage\.mjs$/ }, (args) => args.importer.endsWith('Send.js') ? ({ path: path.join(__dirname, 'uploadImage.mjs') }) : undefined);
    } }],
  });
  const server = http.createServer(async (req, res) => {
    const json = (body, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    try {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      // The demo is deliberately local and uses fake Firebase transport and an in-memory database.
      if (req.headers.host !== `127.0.0.1:${port}` && req.headers.host !== `localhost:${port}`) return json({ error: 'Invalid demo host' }, 403);
      if (req.headers.origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) return json({ error: 'Invalid origin' }, 403);
      if (req.method === 'GET' && ['/app.js', '/style.css', '/'].includes(url.pathname)) {
        const type = url.pathname === '/app.js' ? 'text/javascript' : url.pathname === '/style.css' ? 'text/css' : 'text/html';
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
        return res.end(url.pathname === '/app.js' ? bundle.outputFiles[0].contents : fs.readFileSync(path.join(__dirname, url.pathname === '/' ? 'index.html' : 'style.css')));
      }
      if (req.method === 'GET' && url.pathname === '/demo/stats') return json({ devices: h.rows.length, messages: h.records.length });
      if (req.method === 'POST' && url.pathname === '/demo/cloudinary-upload') {
        const chunks = []; let bytes = 0;
        for await (const chunk of req) { bytes += chunk.length; if (bytes > 6 * 1024 * 1024) return json({ error: { message: 'Image too large' } }, 413); chunks.push(chunk); }
        const form = await new Request('http://localhost/upload', { method: 'POST', headers: { 'Content-Type': req.headers['content-type'] }, body: Buffer.concat(chunks) }).formData();
        if (form.get('upload_preset') !== 'demo-unsigned') return json({ error: { message: 'Upload preset not found' } }, 400);
        const image = form.get('file');
        if (!image || !['image/png', 'image/jpeg'].includes(image.type)) return json({ error: { message: 'Invalid image' } }, 400);
        return json({ secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', simulated: true });
      }
      let body = {};
      if (req.method === 'POST') {
        const chunks = []; let length = 0;
        for await (const chunk of req) { length += chunk.length; if (length > 65536) return json({ error: 'Request too large' }, 413); chunks.push(chunk); }
        body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      }
      if (req.method === 'POST' && url.pathname === '/demo/scenario') {
        if (!['mixed', 'healthy', 'empty', 'outage'].includes(body.scenario)) return json({ error: 'Invalid scenario' }, 400);
        reset(body.scenario); return json({ reset: true });
      }
      const handlers = { 'GET /strapi-fcm/config': 'getConfig', 'POST /strapi-fcm/config': 'setConfig', 'POST /strapi-fcm/send': 'sendNotifications', 'GET /strapi-fcm/sent': 'sentNotifications' };
      const handler = handlers[`${req.method} ${url.pathname}`];
      if (!handler) return json({ error: 'Not found' }, 404);
      if (body.sdk) return json({ error: { message: 'Use sample server-managed credentials in this demo. Do not upload real credentials.' } }, 400);
      const ctx = { request: { body }, query: Object.fromEntries(url.searchParams) };
      await controller[handler](ctx);
      json(ctx.body, ctx.status || 200);
    } catch { json({ error: { message: 'Invalid demo request.' } }, 400); }
  });
  server.listen(port, '127.0.0.1', () => console.log(`Strapi FCM demo: http://127.0.0.1:${port} (simulated Firebase; no real notifications)`));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
