const express = require("express");
const otpController = require("../controller/otpController");

const Router = express.Router();

Router.route("/otp/checkOTP").post(otpController.ConfirmOTP);
Router.route("/otp/resendOTP").get(otpController.resendOTP);


module.exports = Router;