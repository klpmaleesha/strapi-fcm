"use strict";
const fs = require("fs");
const { messaging } = require("../utils/firebase");

module.exports = {
  async sdk(ctx) {
    try {
      ctx.body = await strapi.plugin("strapi-fcm").service("service").findSDK();
    } catch (err) {
      ctx.body = {
        message: "error",
        error: error.message,
      };
    }
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
  async send(ctx) {
    try {
      ctx.body = await strapi
        .plugin("strapi-fcm")
        .service("service")
        .sendNotification(ctx.request.body);
    } catch (error) {
      ctx.body = {
        message: "error",
        error: error.message,
      };
    }
  },

  async notifications(ctx) {
    ctx.body = {
      message: "Notifications",
    };
  },
};
