const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, Professionals } = require("../models/index");
const { generateToken } = require("../utils/jwtUtils");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { google_ID: profile.id } });

        if (!user) {
          // Verificar se o e-mail corresponde a um profissional existente
          const professional = await Professionals.findOne({
            where: { email: profile.emails[0].value, user_id: null },
          });

          // Criar o utilizador
          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            google_Id: profile.id,
            fotoUrl: profile.photos[0].value,
            is_verified: profile.emails[0].verified,
          });

          // Associar o utilizador ao profissional, se existir
          if (professional) {
            await professional.update({ user_id: user.user_id });
          }
        }

        // Atualizar informações do utilizador, se necessário
        await user.update({
          username: user.username || profile.displayName, 
          fotoUrl: profile.photos[0].value,
        });

        // Gerar o token de autenticação
        const token = await generateToken(user);

        return done(null, { user, token });
      } catch (error) {
        console.error("Erro na autenticação com Google:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
