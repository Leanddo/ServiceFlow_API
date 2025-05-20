const express = require("express");
const passport = require("passport");
const { googleAuth, googleCallback } = require("../../controller/authController/googleAuthController");

const Router = express.Router();

Router.get("/auth/google", googleAuth)

Router.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, data, info) => {
        if (err || !data || !data.user) {
            console.error("Erro na autenticação com Google:", err || "Utilizador não encontrado");
            return res.redirect("http://localhost:4200/auth/login");
        }

        const token = data.token;

        res.cookie("authcookie", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        res.redirect("http://localhost:4200/auth/google-success");
    })(req, res, next);
});

module.exports = Router;
