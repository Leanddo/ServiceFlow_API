const express = require("express");
const passport = require("passport");
const { googleAuth, googleCallback } = require("../controller/googleAuthController");

const Router = express.Router();

Router.route("/google").get(googleAuth);
Router.route("/google/callback").get( passport.authenticate("google", { session: false }),googleCallback);

module.exports = Router;
