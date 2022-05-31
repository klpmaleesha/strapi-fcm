module.exports = [
  {
    method: "POST",
    path: "/upload",
    handler: "controller.upload",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/sdk",
    handler: "controller.sdk",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/send",
    handler: "controller.send",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/notifications",
    handler: "controller.notifications",
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
];
