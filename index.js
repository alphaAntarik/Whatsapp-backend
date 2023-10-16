const express = require("express");
const mongoose = require("mongoose");
const user_route = require("./routes/user_router");
// const chat_route = require("./routes/chat_router");
const { Chat } = require("./models/chat_models");
// const axios = require("axios");

const PORT = 3000;

const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose
  .connect("mongodb://127.0.0.1:27017/whatsapp_backend")
  .then(() => {
    console.log("connceted to MongoDB");
    app.use((req, res, next) => {
      res.header("Cache-Control", "no-store");
      next();
    });
    app.use((req, res, next) => {
      const start = Date.now();
      next();
      const delta = Date.now() - start;
      console.log(`${req.method} ${req.url} ${delta}ms`);
    });

    app.use(express.json());

    app.use("/whatsapp_users", user_route);
    // app.use("/whatsapp_chats", chat_route);

    const connectedUsers = new Map(); // Map to store connected users and their socket connections

    io.on("connection", (socket) => {
      console.log("A user connected");
      socket.on("joinChatRoom", async ({ sender, receiver }) => {
        // Fetch old chats where the sender and receiver match
        const oldChats = await Chat.find({
          $or: [
            { from: sender, to: receiver },
            { from: receiver, to: sender },
          ],
        })
          .sort({ timestamp: 1 })
          .lean();

        socket.emit("oldChats", oldChats);
      });
      // socket.on("joinChatRoom", async () => {
      //   const oldChats = await Chat.find().sort({ timestamp: 1 }).lean();
      //   socket.emit("oldChats", oldChats);
      // });

      socket.on("newChatMessage", (data) => {
        const { from, to } = data;

        // Save the chat message to MongoDB
        const chat = new Chat(data);
        chat
          .save()
          .then(() => {
            console.log("Chat message saved to MongoDB");
          })
          .catch((err) => {
            console.error(err);
          });

        // Emit the message to the sender
        socket.emit("newChatMessage", chat);

        // Emit the message to the receiver if they are online
        if (connectedUsers.has(to)) {
          const receiverSocket = connectedUsers.get(to);
          receiverSocket.emit("newChatMessage", chat);
        }
      });

      // Store the socket connection in the map when a user connects
      socket.on("userConnected", (userId) => {
        connectedUsers.set(userId, socket);
      });

      // Handle disconnection and remove the socket from the map
      socket.on("disconnect", () => {
        console.log("A user disconnected");
        for (const [userId, userSocket] of connectedUsers) {
          if (userSocket === socket) {
            connectedUsers.delete(userId);
          }
        }
      });
    });

    // io.on("connection", (socket) => {
    //   console.log("A user connected");

    //   //   socket.emit('getUsersByNameAndDOB', { name: 'abc', dob: '29/09/2000' });
    //   // });

    //   // socket.on('matchingUsers', (users) => {
    //   //   console.log('Matching users:', users);
    //   //   // Process the list of matching users as needed
    //   // });

    //   socket.on("joinChatRoom", async () => {
    //     const oldChats = await Chat.find().sort({ timestamp: 1 }).lean();
    //     const filteredOldChats = oldChats.filter(
    //       (chat) => chat.from === socket.id || chat.to === socket.id
    //     );
    //     socket.emit("oldChats", filteredOldChats);
    //   });

    //   // socket.on("joinChatRoom", async () => {
    //   //   const oldChats = await Chat.find().sort({ timestamp: 1 }).lean();
    //   //   socket.emit("oldChats", oldChats);
    //   // });

    //   // Handle new chat messages
    //   socket.on("newChatMessage", (data) => {
    //     // try {
    //     //   data = JSON.parse(data);
    //     // } catch (err) {
    //     //   console.error("Error parsing chat message data:", err);
    //     //   return;
    //     // }

    //     //   // Create a new chat instance

    //     const chat = new Chat(data);
    //     //   chat
    //     //     .save()
    //     //     .then(() => {
    //     //       console.log("Chat message saved to MongoDB");
    //     //       io.emit("newChatMessage", chat);
    //     //     })
    //     //     .catch((err) => {
    //     //       console.error(err);
    //     //     });
    //     // });
    //     chat
    //       .save()
    //       .then(() => {
    //         console.log("Chat message saved to MongoDB");
    //         io.to([chat.from, chat.to]).emit("newChatMessage", chat);
    //       })
    //       .catch((err) => {
    //         console.error(err);
    //       });
    //   });

    //   // When a new chat message is received
    //   // socket.on("chat message", (data) => {
    //   //   // Ensure that the data is parsed to an object
    //   //   try {
    //   //     data = JSON.parse(data);
    //   //   } catch (err) {
    //   //     console.error("Error parsing chat message data:", err);
    //   //     return;
    //   //   }

    //   //   // Create a new chat instance
    //   //   const chat = new Chat(data);

    //   //   // Save the chat message to MongoDB using promises
    //   //   chat
    //   //     .save()
    //   //     .then(() => {
    //   //       console.log("Chat message saved to MongoDB");
    //   //     })
    //   //     .catch((err) => {
    //   //       console.error("Error saving chat message:", err);
    //   //     });

    //   //   // Broadcast the message to all connected clients
    //   //   io.emit("chat message", data);
    //   // });

    //   // Handle disconnection
    //   socket.on("disconnect", () => {
    //     console.log("A user disconnected");
    //   });
    // });

    // Start the server
    // server.listen(5000, () => {
    //   console.log("Server is running on http://localhost:5000");
    // });
    server.listen(PORT, () => console.log(`Listening to ${PORT}`));
  })
  .catch((err) => console.log("Something went wrong"));
