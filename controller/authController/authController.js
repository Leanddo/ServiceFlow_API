const { User,OTP } = require("../../models/index");

const bcrypt = require("bcrypt");

const { httpCode } = require("../../utils/httpCodeHandler");
const { generateToken } = require("../../utils/jwtUtils");
const sendEmail = require("../../utils/emailSender");

require("dotenv").config();

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (!username || !email || !password) {
      return httpCode(401, { error: "All fields are required" }, res);
    }

    if (existingUser) {
      return httpCode(400, { error: "This email is already taken" }, res);
    }

    if (password.length < 6) {
      return httpCode(
        400,
        { error: "Password must be at least 6 characters" },
        res
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await OTP.create({
      OTPCode: hashedOtp,
      user_id: createdUser.user_id,
      otpExpires: expiresAt,
    });

    await sendEmail(email, otp);

    const token = await generateToken(createdUser.user_id);

    res.cookie("authcookie", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return httpCode(201, { username, email }, res);
  } catch (error) {
    console.log(error);
    return httpCode(500, { error: "Internal server error" }, res);
  }
};

exports.login = async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    httpCode(400, { error: "incorrect username or email" }, res);
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return httpCode(400, { error: "Email ou senha incorretos" }, res);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = await generateToken(user.user_id);

      res.cookie("authcookie", token, {
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