// const { Chat } = require("../models/chat_models");

// async function getChats(req, res) {
//   try {
//     let chats = await Chat.find({ from: req.body.from, to: req.body.to });
//     if (chats) {
//       res.send(chats);
//     } else {
//       res.status(400).send("no user found");
//     }
//   } catch (e) {
//     res.status(400).send(e);
//   }
// }

// module.exports = {
//   getChats,
// };
