const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User, PasswordResetToken } = require("../models");
const sendEmail = require("../utils/emailSender"); // Função para envio de e-mails
const path = require("path");
const { Op } = require("sequelize");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o e-mail está registrado
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "E-mail não encontrado." });
    }

    // Gerar um token único e sua validade
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar o token no banco de dados
    await PasswordResetToken.create({
      user_id: user.user_id,
      token: hashedToken,
      expires_at: expiresAt,
    });

    // Enviar o e-mail com o link de redefinição
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const placeholders = {
      USERNAME: user.username,
      RESET_LINK: resetLink,
    };

    await sendEmail({
      to: email,
      subject: "Redefinição de Senha",
      templatePath: path.join(__dirname, "../templates/resetPasswordTemplate.html"),
      placeholders,
    });

    res.status(200).json({
      message: "E-mail de redefinição de senha enviado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    res.status(500).json({ message: "Erro ao solicitar redefinição de senha." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Verificar se o token é válido
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const resetToken = await PasswordResetToken.findOne({
      where: { token: hashedToken, expires_at: { [Op.gt]: new Date() } },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    // Verificar se o usuário existe
    const user = await User.findByPk(resetToken.user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualizar a senha do usuário
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    // Remover o token usado
    await resetToken.destroy();

    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    res.status(500).json({ message: "Erro ao redefinir a senha." });
  }
};