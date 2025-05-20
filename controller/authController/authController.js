const { User, OTP, Professionals, Queues } = require("../../models/index");

const bcrypt = require("bcrypt");
const path = require("path");

const { generateToken } = require("../../utils/jwtUtils");
const sendEmail = require("../../utils/emailSender");

require("dotenv").config();

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(401).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "This email is already taken" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Verificar se o e-mail corresponde a um profissional existente
    const professional = await Professionals.findOne({
      where: { email, user_id: null },
    });

    if (professional) {
      // Associar o utilizador recém-criado ao profissional
      await professional.update({ user_id: createdUser.user_id });
    }

    // Verificar se existem filas associadas ao e-mail
    const existingQueues = await Queues.findAll({
      where: { client_email: email, user_id: null },
    });

    if (existingQueues.length > 0) {
      // Associar o user_id às filas onde o e-mail está registrado
      await Queues.update(
        { user_id: createdUser.user_id },
        { where: { client_email: email, user_id: null } }
      );
    }

    // Criar e guardar OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await OTP.create({
      OTPCode: hashedOtp,
      user_id: createdUser.user_id,
      otpExpires: expiresAt,
    });

    // Enviar email com OTP
    const placeholders = {
      USERNAME: username,
      OTP: otp,
    };

    await sendEmail({
      to: email,
      subject: "Seu código OTP para o ServiceFlow",
      templatePath: path.join(__dirname, "../../templates/otpTemplate.html"),
      placeholders,
    });

    // Gerar token e definir cookie
    const token = await generateToken(createdUser);

    res.cookie("authcookie", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({ username, email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: "incorrect username or email" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Email ou senha incorretos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password or email" });
    }

    const token = await generateToken(user);

    res.cookie("authcookie", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    if (!user.is_verified) {
      return res.status(403).json({ error: "Conta não verificada. Por favor, confirma o teu email." });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.logout = async (req, res) => {
  res.clearCookie('authcookie', {
    httpOnly: true,
    secure: true,   // se usas HTTPS
    sameSite: 'Strict',
    path: '/',      // tem de ser o mesmo path do cookie original
  });

  res.status(200).send({ message: 'Logout successful' });
}