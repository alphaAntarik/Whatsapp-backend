const express = require("express");
const router = express.Router();
const {
  postUser,
  login_using_email,
  login_using_phoneNumber,
  upload,
  imageUpload,
  updateuser,
  deleteuser,
} = require("../controllers/auth_controller");

//router.use(express.static(__dirname));
router.post("/signup", postUser);
router.post("/loginEmail", login_using_email);
router.post("/imageUpload", upload.single("image"), imageUpload);
router.post("/loginPhoneNumber", login_using_phoneNumber);
router.put("/update/:id", updateuser);
router.delete("/delete/:id", deleteuser);
router.use(express.static("uploads"));

module.exports = router;
