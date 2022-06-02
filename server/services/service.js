"use strict";

const admin = require("firebase-admin");

function getPluginStore() {
  return strapi.store({
    environment: "",
    type: "plugin",
    name: "strapi-fcm",
  });
}

async function createDefultConfig() {
  const pluginStore = getPluginStore();
  await pluginStore.set({
    key: "config",
    value: {
      preset: "",
      cloud: "",
      created: "",
    },
  });
  return pluginStore.get({ key: "config" });
}

module.exports = () => ({
  async setConfig(config) {
    const pluginStore = getPluginStore();
    await pluginStore.set({
      key: "config",
      value: {
        preset: config.preset,
        cloud: config.cloud,
        created: true,
        sdk: config.sdk,
      },
    });
    return await pluginStore.get({ key: "config" });
  },
  async getConfig() {
    const pluginStore = getPluginStore();
    const config = await pluginStore.get({ key: "config" });
    if (!config.created) {
      await createDefultConfig();
    }
    return {
      config,
      message: "found",
    };
  },
  async sendNotification(notification) {
    const data = await this.getConfig();

    if (admin.apps.length == 0) {
      admin.initializeApp({
        credential: admin.credential.cert(data.config.sdk),
      });
    }
    const messaging = admin.messaging();
    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
      },

      topic: "all",
    };
    if (notification.image) {
      payload.webpush.headers.image = notification.image;
    }

    if (data) {
      const data = await messaging.send(payload);
      return {
        data,
        notification,
      };
    }
  },
  async getNotifications() {
    const notifications = await strapi.entityService.findMany(
      "api::notification.notification",
      {
        fields: ["title", "body", "image"],
        sort: { createdAt: "DESC" },
      }
    );
    return notifications;
  },
  async addToken(token) {
    console.log(token);
    const { data: create } = await strapi.entityService.create(
      "api::token.token",
      {
        data: {
          token,
        },
      }
    );
    return create;
  },
});
