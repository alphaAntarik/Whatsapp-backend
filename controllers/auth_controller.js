const { User, validator } = require("../models/user_model");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const multer = require("multer");
// const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});
async function imageUpload(req, res) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json(req.file.filename);
    return;
  } catch (e) {
    return res.status(400).send(e);
  }
}

async function postUser(req, res) {
  const { error } = validator(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.data);
  }

  try {
    let user = new User(
      _.pick(req.body, [
        "name",
        "email",
        "password",
        "phonenumber",
        "profileImage",
        "_id",
      ])
    );
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
}

async function login_using_email(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Incorrect email or password.");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).send("Incorrect email or password.");
    }

    res.json(user);
  } catch (e) {
    return res.status(400).send(e);
  }
}
async function getUserById(req, res) {
  try {
    let user = await User.findOne({ _id: req.body.id });
    if (!user) {
      return res.status(400).send({ error: "user doesn't exits" });
    }

    res.json(user);
  } catch (e) {
    return res.status(400).send(e);
  }
}

async function login_using_phoneNumber(req, res) {
  try {
    let user = await User.findOne({ phonenumber: req.body.phonenumber });
    if (!user) {
      return res.status(400).send("Incorrect email or password.");
    }

    // Then validate the Credentials in MongoDB match
    // those provided in the request
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).send("Incorrect email or password.");
    }

    res.json(user);
  } catch (e) {
    return res.status(400).send(e);
  }
}
async function updateuser(req, res) {
  try {
    const myDocument = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(myDocument);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}
async function deleteuser(req, res) {
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.sendStatus(404);
    res.json("deleated");
  } catch (e) {
    return res.sendStatus(400).send({ error: "error occured" });
  }
}

module.exports = {
  postUser,
  login_using_email,
  login_using_phoneNumber,
  upload,
  imageUpload,
  updateuser,
  deleteuser,
  getUserById,
};
