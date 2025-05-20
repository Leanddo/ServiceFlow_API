const passport = require("passport");

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});
  