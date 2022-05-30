"use strict";
const fs = require("fs");
const { messaging } = require("../utils/firebase");

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin("strapi-fcm")
      .service("myService")
      .getWelcomeMessage();
  },
  async upload(ctx) {
    await fs.promises.writeFile(
      "./config/config.json",
      ctx.request.body.config
    );
    ctx.body = {
      message: "Config uploaded successfully",
    };
  },
  config(ctx) {
    const config = fs.existsSync("./config/config.json");

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
    const config = fs.existsSync("./config/config.json");
    const payload = {
      notification: {
        title: ctx.request.body.title,
        body: ctx.request.body.body,
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
};
