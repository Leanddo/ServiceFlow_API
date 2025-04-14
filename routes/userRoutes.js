const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const {requireAuth} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

const Router = express.Router();

Router.get("/user/profile", requireAuth, userController.getProfile);
Router.put("/user/profile", requireAuth, upload, userController.updateProfile);
Router.delete("/user/profile/image", requireAuth, userController.deleteProfileImage);

Router.put("/user/password", requireAuth, userController.updatePassword);
Router.delete("/user/account", requireAuth, userController.deleteAccount);

module.exports = Router;
