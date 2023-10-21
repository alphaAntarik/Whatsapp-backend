const mongoose = require("mongoose");

const Status = mongoose.model(
  "Status_db",
  new mongoose.Schema({
    user_id: {
      type: String,
      required: true,
      minlength: 24,
    },
    name: {
      type: String,
      required: true,
      minlength: 5,
    },

    status: {
      type: String,
      required: true,
      minlength: 1,
    },
    dateonly: {
      type: String,
      required: true,
      minlength: 1,
    },
    type: {
      type: String,
      required: true,
      minlength: 1,
    },
    timestamp: { type: Date, default: Date.now },
  })
);

module.exports = {
  Status,
};
