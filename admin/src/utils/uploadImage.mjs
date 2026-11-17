// Only the image and unsigned preset are sent to Cloudinary. Never send Firebase credentials.
export async function uploadImage({ file, cloud, preset, fetcher = fetch }) {
  if (typeof cloud !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(cloud.trim()) || typeof preset !== 'string' || !preset.trim()) {
    throw new Error('Set a Cloudinary cloud name and unsigned upload preset in Settings, or use an HTTPS image URL.');
  }
  if (!file || !['image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
    throw new Error('Choose a PNG or JPEG image between 1 byte and 5 MB.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset.trim());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetcher(`https://api.cloudinary.com/v1_1/${cloud.trim()}/image/upload`, {
      method: 'POST', body: form, signal: controller.signal,
    });
    let result;
    try { result = await response.json(); }
    catch { throw new Error('Cloudinary returned an unreadable response. Check your connection and upload settings.'); }
    if (!response.ok || result.error) {
      const reason = typeof result.error?.message === 'string' ? ` ${result.error.message.replace(/[.!?]+$/, '')}.` : '';
      throw new Error(`Cloudinary upload failed (${response.status}).${reason} Check that the preset allows unsigned image uploads.`);
    }
    let url;
    try { url = new URL(result.secure_url); }
    catch { throw new Error('Cloudinary did not return a valid HTTPS image URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Cloudinary did not return a valid HTTPS image URL.');
    return url.href;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Cloudinary upload timed out. Check your connection and try again.');
    if (error instanceof TypeError) throw new Error('Could not reach Cloudinary. Check your connection and try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}
