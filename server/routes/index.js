module.exports = [
  {
    method: "GET",
    path: "/",
    handler: "controller.index",
    config: {
      policies: [],
    },
  },
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
    path: "/config",
    handler: "controller.config",
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
];
