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
    const sdk = await this.getConfig();

    if (admin.apps.length == 0) {
      admin.initializeApp({
        credential: admin.credential.cert(sdk.config.sdk),
      });
    }
    const messaging = admin.messaging();

    const tokens = await strapi.db.query("plugin::strapi-fcm.token").findMany();

    const registrationTokens = [];

    registrationTokens.push(...tokens.map((token) => token.token));

    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
    };
    if (notification.image) payload.notification.image = notification.image;
    if (notification.title.trim() && notification.body.trim()) {
      const entry = await strapi.db
        .query("plugin::strapi-fcm.notification")
        .create({
          data: {
            title: notification.title,
            body: notification.body,
            image: notification?.image,
          },
        });
    }
    if (sdk) {
      const response = await messaging.sendToDevice(
        registrationTokens,
        payload
      );
      return {
        response,
        entry,
      };
    }
  },
  async getNotifications() {
    const notifications = await strapi.db
      .query("plugin::strapi-fcm.notification")
      .findMany({
        select: ["id", "title", "body", "image", "created_at"],
        orderBy: { createdAt: "DESC" },
        populate: { category: true },
      });

    return notifications;
  },
  async addToken(fcm) {
    const addToken = await strapi.db.query("plugin::strapi-fcm.token").create({
      data: {
        token: fcm.token,
      },
    });
    return addToken;
  },
});
