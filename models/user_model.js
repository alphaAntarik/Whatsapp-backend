const joi = require("joi");
const mongoose = require("mongoose");

const User = mongoose.model(
  "Whatsapp_Users",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    // lastmessage: {
    //   type: String,
    //   minlength: 0,
    //   //   required: true,
    // },
    // lastmessageuserid: {
    //   type: String,
    //   minlength: 0,
    //   //  required: true,
    // },
    phonenumber: {
      type: String,
      required: true,
      minlength: 10,
      //maxlength: 10,
      unique: true,
    },
    profileImage: {
      type: String,
      minlength: 0,
      // required: true,
    },
  })
);

function validator(user) {
  const schema = joi.object({
    name: joi.string().min(5).max(20).required(),
    email: joi.string().min(10).max(255).required().email(),
    password: joi.string().min(8).max(1024).required(),
    phonenumber: joi.string().min(11).required(),
    profileImage: joi.string().min(0),
    // lastmessage: joi.string().min(0),
    // lastmessageuserid: joi.string().min(0),
  });
  return schema.validate(user);
}

module.exports = {
  User,
  validator,
};
