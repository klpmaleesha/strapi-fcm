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

module.exports = ({ strapi }) => ({
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
  async sendNotification(data) {
    if (admin.apps.length == 0) {
      admin.initializeApp({
        credential: admin.credential.cert(await this.getConfig().sdk),
      });
    }

    const messaging = admin.messaging();

    const config = await this.getConfig();
    const payload = {
      notification: {
        title: data.title,
        body: data.body,
      },
      webpush: {
        headers: {
          image: data.image,
        },
      },
      topic: "all",
    };

    if (config) {
      const data = await messaging.send(payload);
      return data;
    }
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
});
