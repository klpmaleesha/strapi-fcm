'use strict';
function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
function validateToken(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 255 || /\s/.test(value.trim())) {
    badRequest('Provide a non-empty FCM registration token without whitespace (maximum 255 characters).');
  }
  return value.trim();
}
function validateNotification(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) badRequest('Provide a notification object.');
  const notification = {};
  for (const [field, max] of [['title', 200], ['body', 2000]]) {
    if (typeof input[field] !== 'string' || !input[field].trim() || input[field].trim().length > max) badRequest(`${field} must contain 1 to ${max} characters.`);
    notification[field] = input[field].trim();
  }
  if (input.image) {
    try {
      const url = new URL(input.image);
      if (typeof input.image !== 'string' || url.protocol !== 'https:' || url.username || url.password) throw new Error();
      notification.imageUrl = url.href;
    } catch { badRequest('The image must be a public HTTPS URL.'); }
  }
  if (input.dryRun !== undefined && typeof input.dryRun !== 'boolean') badRequest('dryRun must be a boolean.');
  const message = { notification };
  if (input.data !== undefined) {
    if (!input.data || typeof input.data !== 'object' || Array.isArray(input.data) ||
        Object.entries(input.data).some(([key, value]) => !key || typeof value !== 'string' || /^(from|message_type|google\..*|gcm\..*)$/.test(key))) {
      badRequest('data must contain string values and no reserved FCM keys.');
    }
    message.data = { ...input.data };
  }
  let tokens;
  if (input.tokens !== undefined) {
    if (!Array.isArray(input.tokens) || !input.tokens.length || input.tokens.length > 5000) badRequest('tokens must contain 1 to 5000 registration tokens.');
    tokens = [...new Set(input.tokens.map(validateToken))];
  }
  if (input.topic !== undefined && input.topic !== '') {
    if (typeof input.topic !== 'string' || !/^[a-zA-Z0-9\-_.~%]{1,900}$/.test(input.topic)) badRequest('Provide a valid FCM topic name without /topics/.');
    if (tokens) badRequest('Choose either tokens or a topic.');
    message.topic = input.topic;
  }
  if (Buffer.byteLength(JSON.stringify(message), 'utf8') > (message.topic ? 1800 : 3800)) badRequest('Notification payload is too large for FCM.');
  return { message, tokens, dryRun: input.dryRun === true };
}
function pagination(query) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 25);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
      !Number.isSafeInteger((page - 1) * pageSize)) badRequest('Use a positive page and a pageSize between 1 and 100.');
  return { page, pageSize, offset: (page - 1) * pageSize };
}
module.exports = { badRequest, validateToken, validateNotification, pagination };
