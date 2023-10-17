const express = require("express");
const mongoose = require("mongoose");
const user_route = require("./routes/user_router");
// const chat_route = require("./routes/chat_router");
const { Chat } = require("./models/chat_models");
const { Status } = require("./models/status_model");
// const axios = require("axios");
const cors = require("cors");

const PORT = 3000;

const http = require("http");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
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

    const chatNamespace = io.of("/chat");
    chatNamespace.on("connection", (socket) => {
      console.log("A user connected to /chat");

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

      socket.on("newChatMessage", (data) => {
        // Save the chat message to MongoDB
        const chat = new Chat(data);

        chat
          .save()
          .then(() => {
            console.log("Chat message saved to MongoDB");
            chatNamespace.emit("newChatMessage", chat); // Broadcast to all connected clients in /chat namespace
          })
          .catch((err) => {
            console.error(err);
          });

        // Emit the message to the receiver if they are online
        if (connectedUsers.has(data.to)) {
          const receiverSocket = connectedUsers.get(data.to);
          receiverSocket.emit("newChatMessage", chat);
        }
      });

      // Handle user disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected from /chat");
      });
    });

    // Status Namespace
    const statusNamespace = io.of("/status");
    statusNamespace.on("connection", (socket) => {
      console.log("A user connected to /status");

      socket.on("previousStatus", async () => {
        // Load previous messages from the database
        const previousStatus = await Status.find()
          .sort({ timestamp: -1 })
          .lean();

        socket.emit("oldStatus", previousStatus);
      });

      socket.on("newStatus", (message) => {
        const newMessage = new Status(message);

        newMessage
          .save()
          .then((savedMessage) => {
            console.log("Message saved to the database");
            statusNamespace.emit("newStatus", savedMessage); // Broadcast to all connected clients in /status namespace
          })
          .catch((err) => {
            console.error("Error saving the message:", err);
          });
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected from /status");
      });
    });

    server.listen(PORT, () => console.log(`Listening to ${PORT}`));
  })
  .catch((err) => console.log("Something went wrong"));
