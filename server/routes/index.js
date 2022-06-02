module.exports = [
  {
    method: "GET",
    path: "/sdk",
    handler: "controller.getSDK",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/send",
    handler: "controller.sendNotifications",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/sent",
    handler: "controller.sentNotifications",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/config",
    handler: "controller.getConfig",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/config",
    handler: "controller.setConfig",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/users/tokens",
    handler: "controller.addTokens",
    config: {
      policies: [],
      auth: false,
    },
  },
];
