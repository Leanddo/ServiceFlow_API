const { User } = require("../models/Users");
const bcrypt = require("bcrypt");

const { httpCode } = require("../utils/httpCodeHandler");
const { generateToken } = require("../utils/jwtUtils");

require("dotenv").config();

exports.signUp = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (!username || !email || !password) {
    }

    if (existingUser) {
      return httpCode(400, { error: "This email is already taken " }, res);
    }

    if (password.length < 6) {
      return httpCode(
        400,
        { error: "Password must be at least 6 characters" },
        res
      );
    }

    const hashedpassword = bcrypt.hashSync(password, 10);

    const createdUser = await User.create({
      username,
      email,
      role,
      password: hashedpassword,
    });
    console.log("opa");

    const token = await generateToken(createdUser.user_id);

    res.cookie("authcookie", token, {
      maxAge: 900000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    httpCode(201, createdUser, res);
  } catch (error) {
    console.log(error);
    httpCode(500, { error: "Internal server error" }, res);
  }
};

exports.login = async (req, res) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!password || !email || !user) {
      httpCode(400, { error: "incorrect username or email" }, res);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = await generateToken(user.user_id);

      res.cookie("authcookie", token, {
        maxAge: 900000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      httpCode(200, { success: true }, res);
    } else {
      httpCode(401, { message: "Incorrect password or email" }, res);
    }
  } catch (error) {
    console.log(error);
    httpCode(500, { error: "Internal server error" }, res);
  }
};
