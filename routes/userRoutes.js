const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const {requireAuth} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

const Router = express.Router();

Router.get("/profile", requireAuth, userController.getProfile);
Router.put("/profile", requireAuth, upload, userController.updateProfile);

module.exports = Router;
