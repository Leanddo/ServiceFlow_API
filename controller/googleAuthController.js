const passport = require("passport");
const { httpCode } = require("../utils/httpCodeHandler");
const { generateToken } = require("../utils/jwtUtils");

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = (req, res) => {
  if (!req.user) {
    return httpCode(401, { error: "Falha na autenticação do Google" }, res);
  }

  res.cookie("authcookie", req.user.token, {
    maxAge: 900000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  httpCode(200, { success: true, user: req.user.user }, res);
};
