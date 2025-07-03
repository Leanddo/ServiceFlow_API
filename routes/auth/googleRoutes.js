const express = require("express");
const passport = require("passport");
const { googleAuth, googleCallback } = require("../../controller/authController/googleAuthController");

const Router = express.Router();
require("dotenv").config();

Router.get("/auth/google", googleAuth)

// Rota de callback para o Google
// Esta rota é chamada pelo Google após o usuário autenticar com sucesso
Router.get("/auth/google/callback", (req, res, next) => {
    // Usar o Passport para autenticar o usuário com a estratégia "google"
    passport.authenticate('google', { session: false }, (err, data, info) => {
        // Verificar se houve erro ou se o usuário não foi encontrado
        if (err || !data || !data.user) {
            console.error("Erro na autenticação com Google:", err || "Utilizador não encontrado");
            // Redirecionar para a página de login em caso de erro
            return res.redirect(`${process.env.HOST}/auth/login`);
        }

        // Obter o token gerado para o usuário autenticado
        const token = data.token;

        // Configurar o cookie de autenticação no cliente
        res.cookie("authcookie", token, {
            httpOnly: true, // O cookie só pode ser acessado pelo servidor
            secure: true,   // O cookie só será enviado em conexões HTTPS
            sameSite: "None", // Permitir que o cookie seja enviado em requisições cross-site
        });

        // Redirecionar o usuário para a página de sucesso após autenticação
        res.redirect(`${process.env.HOST}`);
    })(req, res, next); // Passar os objetos req, res e next para o middleware do Passport
});

module.exports = Router;
