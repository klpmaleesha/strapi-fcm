'use strict';
module.exports = ({ strapi }) => {
  const handle = (operation) => async (ctx) => {
    try { ctx.body = await operation(strapi.plugin('strapi-fcm').service('service'), ctx); }
    catch (error) {
      const status = [400, 409].includes(error.status) ? error.status : 502;
      const message = status === 502
        ? 'The operation failed. Check server logs and delivery history before retrying; some devices may have received the notification.' : error.message;
      if (status === 502) strapi.log.error('Strapi FCM operation failed', { code: error.code || 'unknown' });
      ctx.status = status;
      ctx.body = { data: null, error: { status, message } };
    }
  };
  return {
    getConfig: handle((service) => service.getConfig()),
    setConfig: handle((service, ctx) => service.setConfig(ctx.request.body)),
    sendNotifications: handle((service, ctx) => service.sendNotification(ctx.request.body)),
    sentNotifications: handle((service, ctx) => service.getNotifications(ctx.query)),
    addTokens: handle((service, ctx) => service.addToken(ctx.request.body)),
  };
};
