'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-fcm')
      .service('myService')
      .getWelcomeMessage();
  },
};
