"use strict";

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
});
