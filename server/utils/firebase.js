const admin = require("firebase-admin");
const serviceAccount = require("../../../../../config/config.json");

if (admin.apps.length == 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();

module.exports = {
  messaging,
};
