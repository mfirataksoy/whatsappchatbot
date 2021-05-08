// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
var fs = require("fs");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
var venom = require("venom-bot");
var admin = require("firebase-admin");
var serviceAccount = require("./privkey.json");
//Initialize cloud storage connection.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "whatsapp-stickers-8776a.appspot.com",
});
var bucket = admin.storage().bucket();
//firestore database connection.
const db = admin.firestore();
const stickersRef = db.collection("stickers");

venom
  .create()
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async (message) => {
    if (message.type === "sticker") {
      const buffer = await client.decryptFile(message);
      //create a random id and assign it to a processing image file.
      const id = uuidv4();
      const fileName = id + ".webp";
      fs.writeFile(fileName, buffer, (err) => {});

      setTimeout(cloud, 4000);
      let downlink = "";

      function cloud() {
        try {
          bucket
            .upload("./" + id + ".webp", { public: true })
            .then((response) => {
              // console.log(response);
              downlink = response[0].metadata.mediaLink;
              stickersRef.doc(id).set({ stickerImageURL: downlink });
              fs.unlink("./" + id + ".webp", (err) => {
                if (err != null) {
                  client.sendText(
                    message.from,
                    "Please send the sticker again. We faced an issue updating our website."
                  );
                  return;
                }
              });
            })
            .catch((error) => {
              console.log("no such file exists.");
              return;
            });
          client.sendText(
            message.from,
            "Your sticker has been uploaded to the website UwU. Please update its tags at https://stickersfornow.netlify.app/update/" +
              id
          );
        } catch (error) {
          console.log(error);
        }
      }

      //upload the image file to the cloud storage.

      // .then((result) => {
      //  // console.log("Result: ", result); //return object success
      // })
      // .catch((erro) => {
      //   console.error("Error when sending: ", erro); //return object error
      // });
    } else if (message.body.substring(0, 22) === "Send me this sticker: ") {
      let docId = message.body.substring(22, message.body.length);

      const doc = await stickersRef.doc(docId).get();

      if (!doc.exists) {
        console.log("No such document!");
        client.sendText(
          message.from,
          "This sticker doesn't exist in our inventory. Please try again."
        );
      } else {
        client.sendImageAsStickerGif(message.from, doc.data().stickerImageURL);
      }
    } else if (message.body === "/random") {
      const numberOfStickers = 5;
      const randomIndex = Math.floor(Math.random() * numberOfStickers);

      stickersRef
        .limitToFirst(randomIndex)
        .limitToLast(1)
        .once("value")
        .then((snapshot) => {
          var sticker = snapshot.val();
          console.log(sticker);
          // do something with the user data
        });
    }
  });
}
