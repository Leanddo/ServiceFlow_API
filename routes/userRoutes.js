const express = require("express");

const createUploadMiddleware = require("../middleware/uploadMiddleware");
const {requireAuth} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

const Router = express.Router();

Router.get("/user/profile", requireAuth, userController.getProfile);
Router.put("/user/profile", requireAuth, createUploadMiddleware("userImg"), userController.updateProfile);
Router.delete("/user/profile/image", requireAuth, userController.deleteProfileImage);

Router.put("/user/password", requireAuth, userController.updatePassword);
Router.delete("/user/account", requireAuth, userController.deleteAccount);

module.exports = Router;
