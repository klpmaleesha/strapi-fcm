'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./support/harness.cjs');
const load = () => import('../admin/src/utils/uploadImage.mjs');
const file = () => new File([new Uint8Array([137,80,78,71,13,10,26,10])], 'test.png', { type: 'image/png' });
const config = { cloud: 'sample-cloud', preset: 'restricted-unsigned' };

test('Cloudinary uses multipart unsigned upload and passes the secure image URL into Firebase', async () => {
  const { uploadImage } = await load();
  let request;
  const image = await uploadImage({ file: file(), ...config, fetcher: async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({ secure_url: 'https://res.cloudinary.com/sample-cloud/image/upload/v1/test.png', url: 'http://res.cloudinary.com/insecure.png' }) };
  } });
  assert.equal(request.url, 'https://api.cloudinary.com/v1_1/sample-cloud/image/upload');
  assert.equal(request.options.method, 'POST');
  assert.ok(request.options.body instanceof FormData);
  assert.deepEqual([...request.options.body.keys()], ['file', 'upload_preset']);
  assert.equal(request.options.body.get('upload_preset'), config.preset);
  assert.equal(request.options.body.get('file').name, 'test.png');
  assert.equal(request.options.headers, undefined); // Browser must supply the multipart boundary.
  const h = harness({ options: { useApplicationDefault: true } });
  await h.service.sendNotification({ title: 'Image test', body: 'A secure Cloudinary image', image, tokens: ['device'] });
  assert.equal(h.batches[0].message.notification.imageUrl, image);
  assert.equal(h.records[0].image, image);
});
test('Cloudinary rejects invalid files or settings before starting an upload', async () => {
  const { uploadImage } = await load();
  let called = false;
  for (const input of [
    { file: file(), cloud: '', preset: 'x' }, { file: file(), cloud: '../other', preset: 'x' },
    { file: file(), cloud: 'cloud', preset: '' }, { file: new File(['text'], 'x.txt', { type: 'text/plain' }), ...config },
    { file: new File([], 'empty.png', { type: 'image/png' }), ...config },
    { file: { type: 'image/png', size: 5 * 1024 * 1024 + 1 }, ...config },
  ]) await assert.rejects(uploadImage({ ...input, fetcher: async () => { called = true; } }));
  assert.equal(called, false);
});
test('Cloudinary surfaces bad presets, network failures and malformed responses', async () => {
  const { uploadImage } = await load();
  await assert.rejects(uploadImage({ file: file(), ...config, fetcher: async () => ({ ok: false, status: 400, json: async () => ({ error: { message: 'Upload preset not found' } }) }) }), /Upload preset not found/);
  await assert.rejects(uploadImage({ file: file(), ...config, fetcher: async () => { throw new TypeError('Failed to fetch'); } }), /Could not reach Cloudinary/);
  await assert.rejects(uploadImage({ file: file(), ...config, fetcher: async () => { throw Object.assign(new Error(), { name: 'AbortError' }); } }), /timed out/);
  await assert.rejects(uploadImage({ file: file(), ...config, fetcher: async () => ({ ok: true, json: async () => { throw new Error(); } }) }), /unreadable response/);
  for (const secure_url of [undefined, 'http://example.com/image.png', 'https://user:pass@example.com/image.png']) {
    await assert.rejects(uploadImage({ file: file(), ...config, fetcher: async () => ({ ok: true, json: async () => ({ secure_url }) }) }), /valid HTTPS/);
  }
});
