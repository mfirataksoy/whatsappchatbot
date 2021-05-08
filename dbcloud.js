var admin = require("firebase-admin");
const functions = require("firebase-functions");
var serviceAccount = require("./privkey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "whatsapp-stickers-8776a.appspot.com",
});

var bucket = admin.storage().bucket();

bucket
  .upload("./test.png", { public: true })
  .then((response) => {
    console.log(response[0].metadata.mediaLink);
  })
  .catch((error) => {
    console.log(error);
  });


var admin = require("firebase-admin");

// Get a database reference to our blog
var db = admin.database();


