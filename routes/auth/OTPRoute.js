const express = require("express");
const otpController = require("../../controller/authController/otpController");

const Router = express.Router();

Router.route("/auth/otp/checkOTP").post(otpController.ConfirmOTP);
Router.route("/auth/otp/resendOTP").get(otpController.resendOTP);


module.exports = Router;