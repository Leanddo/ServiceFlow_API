const passport = require("passport");
const { httpCode } = require("../../utils/httpCodeHandler");

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = async (req, res) => {
  if (!req.user) {
    return httpCode(401, { error: "Falha na autenticação do Google" }, res);
  }

  res.cookie("authcookie", req.user.token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  httpCode(200, { success: true }, res);
};
