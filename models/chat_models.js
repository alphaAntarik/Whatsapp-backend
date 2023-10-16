const mongoose = require("mongoose");
const joi = require("joi");

const Chat = mongoose.model(
  "Chat_db",
  new mongoose.Schema({
    from: {
      type: String,
      required: true,
      minlength: 24,
    },
    to: {
      type: String,
      required: true,
      minlength: 24,
    },
    message: {
      type: String,
      required: true,
      minlength: 1,
    },
    dateonly: {
      type: String,
      required: true,
      minlength: 1,
    },
    timestamp: { type: Date, default: Date.now },

    typeOfMessage: {
      type: String,
      required: true,
      minlength: 1,
    },
  })
);

function validator_chat(user) {
  const schema = joi.object({
    from: joi.string().min(24).required(),
    to: joi.string().min(24).required(),
    message: joi.string().min(1).required(),
    dateonly: joi.string().min(1).required(),
    timestamp: joi.date(),
    typeOfMessage: joi.string().min(1).required(),
  });
  return schema.validate(user);
}

module.exports = {
  Chat,
  validator_chat,
};
