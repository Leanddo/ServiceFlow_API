const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/Users");
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
        let user = await User.findOne({ where: { google_Id: profile.id } });


        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            google_Id: profile.id,
            fotoUrl: profile.photos[0].value,
            is_verified: profile.emails[0].verified,
          });
        }

        await User.update(
          { username: profile.displayName, },
          {
            where: {
              google_Id: profile.id,
            },
          }
        ); 
      

        const token = await generateToken(user.user_id);
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
