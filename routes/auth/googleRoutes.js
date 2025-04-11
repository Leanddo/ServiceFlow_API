const express = require("express");
const passport = require("passport");
const { googleAuth, googleCallback } = require("../../controller/authController/googleAuthController");

const Router = express.Router();

Router.route("/auth/google").get(googleAuth);
Router.route("/auth/google/callback").get( passport.authenticate("google", { session: false }),googleCallback);

module.exports = Router;
