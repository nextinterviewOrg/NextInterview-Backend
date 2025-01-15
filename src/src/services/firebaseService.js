const admin = require("firebase-admin");
const base64ServiceAccount = require("./../utils/constants").base64ServiceAccount;


// const serviceAccount = require("../utils/next-interview-2f671-firebase-adminsdk-7oywv-699472e1f8.json");
const serviceAccountJSON = Buffer.from(base64ServiceAccount, "base64").toString(
  "utf8"
);

const serviceAccount = JSON.parse(serviceAccountJSON);



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "next-interview-2f671.firebasestorage.app",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };