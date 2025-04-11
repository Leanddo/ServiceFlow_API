const express = require("express");

const {requireAuth} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

const Router = express.Router();

Router.get("/profile", requireAuth, userController.getProfile);

module.exports = Router;
