'use strict';

module.exports = async ({ strapi }) => {
  await strapi.admin.services.permission.actionProvider.registerMany([
    { section: 'plugins', displayName: 'Read notifications and configuration status', uid: 'read', pluginName: 'strapi-fcm' },
    { section: 'plugins', displayName: 'Send notifications', uid: 'send', pluginName: 'strapi-fcm' },
    { section: 'plugins', displayName: 'Configure Firebase and image uploads', uid: 'configure', pluginName: 'strapi-fcm' },
  ]);
};
