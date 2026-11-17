'use strict';
module.exports = (_config, { strapi }) => {
  const clients = new Map();
  return async (ctx, next) => {
    const { windowMs = 60000, max = 30 } = strapi.config.get('plugin.strapi-fcm.registrationRateLimit', {});
    const now = Date.now();
    for (const [key, value] of clients) if (value.reset <= now) clients.delete(key);
    const key = ctx.ip;
    const client = clients.get(key) || { count: 0, reset: now + windowMs };
    if ((!clients.has(key) && clients.size >= 10000) || ++client.count > max) {
      ctx.set('Retry-After', String(Math.max(1, Math.ceil((client.reset - now) / 1000))));
      ctx.status = 429;
      ctx.body = { error: { status: 429, message: 'Too many token registrations. Try again later.' } };
      return;
    }
    clients.set(key, client);
    await next();
  };
};
