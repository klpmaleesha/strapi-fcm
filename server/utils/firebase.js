const admin = require("firebase-admin");
const fs = require("fs");
let serviceAccount;
let messaging;

if (fs.existsSync("./config/config.json")) {
  serviceAccount = require("../../../../../config/config.json");

  if (admin.apps.length == 0) {
    admin.initializeApp({
      credential: admin.credential?.cert(serviceAccount),
    });
  }

  messaging = admin?.messaging();
}

module.exports = {
  messaging,
};
