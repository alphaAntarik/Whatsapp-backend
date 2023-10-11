const express = require("express");
const mongoose = require("mongoose");
const user_route = require("./routes/user_router");

const app = express();

const PORT = 3000;

mongoose
  .connect("mongodb://127.0.0.1:27017/whatsapp_backend")
  .then(() => {
    console.log("connceted to MongoDB");
    app.use((req, res, next) => {
      const start = Date.now();
      next();
      const delta = Date.now() - start;
      console.log(`${req.method} ${req.url} ${delta}ms`);
    });

    app.use(express.json());

    //app.use("/uploads", express.static("uploads"));
    // app.get(
    //   "/uploads",
    //   express.static(path.join(__dirname, "./uploads/images/"))
    // );

    app.use("/whatsapp_users", user_route);
    app.listen(PORT, () => console.log(`Listening to ${PORT}`));
  })
  .catch((err) => console.log("Something went wrong"));
