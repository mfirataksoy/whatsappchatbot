// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
var fs = require("fs");
var mime = require("mime-types");
var venom = require("venom-bot");

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
      // At this point you can do whatever you want with the buffer
      // Most likely you want to write it into a file
      console.log(buffer);
      const fileName = `rand.webp`;
      await fs.writeFile(fileName, buffer, (err) => {});
      client.sendText(
        message.from,
        "your sticker has been uploaded to the website. thank you"
      );

      // .then((result) => {
      //  // console.log("Result: ", result); //return object success
      // })
      // .catch((erro) => {
      //   console.error("Error when sending: ", erro); //return object error
      // });
    }
  });
}
