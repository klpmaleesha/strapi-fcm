'use strict';
const adminRoute = (method, path, handler, action) => ({
  method, path, handler: `controller.${handler}`,
  config: { policies: ['admin::isAuthenticatedAdmin', {
    name: 'admin::hasPermissions', config: { actions: [`plugin::strapi-fcm.${action}`] },
  }] },
});
module.exports = {
  admin: { type: 'admin', routes: [
    adminRoute('POST', '/send', 'sendNotifications', 'send'),
    adminRoute('GET', '/sent', 'sentNotifications', 'read'),
    adminRoute('GET', '/config', 'getConfig', 'read'),
    adminRoute('POST', '/config', 'setConfig', 'configure'),
    { method: 'POST', path: '/users/tokens', handler: 'controller.addTokens',
      config: { auth: false, policies: [], middlewares: ['plugin::strapi-fcm.registration-limit'] } },
  ] },
};
