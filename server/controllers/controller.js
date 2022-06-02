"use strict";

module.exports = {
  async getSDK(ctx) {
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
  async sendNotifications(ctx) {
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

  async sentNotifications(ctx) {
    try {
      ctx.body = await strapi
        .plugin("strapi-fcm")
        .service("service")
        .getNotifications();
    } catch (error) {
      ctx.body = {
        message: "error",
        error: error.message,
      };
    }
  },
  async addTokens(ctx) {
    try {
      ctx.body = await strapi
        .plugin("strapi-fcm")
        .service("service")
        .addToken(ctx.request.body);
    } catch (error) {
      ctx.body = {
        message: "error",
        error: error.message,
      };
    }
  },
};
