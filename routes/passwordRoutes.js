const express = require("express");
const router = express.Router();
const passwordController = require("../controller/authController/passwordController");

// Solicitar redefinição de senha
router.post("/forgot-password", passwordController.forgotPassword);

// Redefinir senha
router.post("/reset-password/:token", passwordController.resetPassword);

module.exports = router;