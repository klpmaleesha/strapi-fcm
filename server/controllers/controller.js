"use strict";
const fs = require("fs");
const { messaging } = require("../utils/firebase");

module.exports = {
  async upload(ctx) {
    await fs.promises.writeFile(
      "./config/config.json",
      ctx.request.body.config
    );
    ctx.body = {
      message: "Config uploaded successfully",
    };
  },
  async sdk(ctx) {
    const config = await strapi
      .plugin("strapi-fcm")
      .service("service")
      .getConfig();

    if (config) {
      ctx.body = {
        message: "found",
      };
    } else {
      ctx.body = {
        message: "not-found",
      };
    }
  },
  async send(ctx) {
    const config = await strapi
      .plugin("strapi-fcm")
      .service("service")
      .getConfig();
    const payload = {
      notification: {
        title: ctx.request.body.title,
        body: ctx.request.body.body,
      },
      webpush: {
        headers: {
          image: ctx.request.body.image,
        },
      },
      topic: "all",
    };

    if (config) {
      const data = await messaging.send(payload);
      ctx.body = {
        message: "Message sent successfully",
        data,
      };
    }
  },
  async notifications(ctx) {
    ctx.body = {
      message: "Notifications",
    };
  },
  async getConfig(ctx) {
    try {
      ctx.body = await strapi
        .plugin("strapi-fcm")
        .service("service")
        .getConfig();
    } catch (error) {
      ctx.body = {
        message: "Config not found",
      };
    }
  },
  async setConfig(ctx) {
    try {
      ctx.body = await strapi
        .plugin("strapi-fcm")
        .service("service")
        .setConfig(ctx.request.body);
    } catch (error) {
      ctx.body = {
        message: "Config not found",
      };
    }
  },
};
