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
  async getConfig() {
    const pluginStore = getPluginStore();
    const config = await pluginStore.get({ key: "config" });
    if (!config) {
      await createDefultConfig();
    }
    return config;
  },
  async setConfig(config) {
    const pluginStore = getPluginStore();
    await pluginStore.set({
      key: "config",
      value: {
        preset: config.preset,
        cloud: config.cloud,
        created: config.created,
        sdk: config.sdk,
      },
    });
    return pluginStore.get({ key: "config" });
  },
  async sendNotification(notification) {
    const config = await this.getConfig();

    if (admin.apps.length == 0) {
      admin.initializeApp({
        credential: admin.credential.cert(config.sdk),
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

    if (config) {
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
  async findSDK() {
    const config = await this.getConfig();
    if (config) {
      return {
        message: "found",
        config,
      };
    }
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
