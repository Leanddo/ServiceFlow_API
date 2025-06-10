const express = require("express");
const authController = require("../../controller/authController/authController");
const { requireAuth } = require("../../middleware/authMiddleware");
const Router = express.Router();

Router.route("/auth/login").post(authController.login);
Router.route("/auth/signup").post(authController.signUp);
Router.route("/auth/logout").post(authController.logout);
Router.get("/auth/is-logged-in", requireAuth , authController.isLoggedIn);


module.exports = Router;