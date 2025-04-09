const bcrypt = require("bcrypt");
const { OTP } = require("../models/OTP");
const { User } = require("../models/Users");
const { verifyToken } = require("../utils/jwtUtils");
const sendEmail = require("../utils/emailSender")

exports.ConfirmOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "Código OTP é obrigatório." });
    }

    const token = req.cookies.authcookie;
    if (!token) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    const decoded = verifyToken(token);
    const user_id = decoded.user_id;

    const otpRecord = await OTP.findOne({
      where: { user_id },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Nenhum código encontrado." });
    }

    const now = new Date();
    if (now > new Date(otpRecord.otpExpires)) {
      // Apaga o OTP se tiver expirado
      await OTP.destroy({ where: { OTP_Id: otpRecord.OTP_Id } });
      return res.status(400).json({ message: "O código expirou. Solicite um novo." });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.OTPCode.toString());
    if (!isMatch) {
      return res.status(400).json({ message: "Código de autenticação inválido." });
    }

    await User.update({ is_verified: true }, { where: { user_id } });
    await OTP.destroy({ where: { OTP_Id: otpRecord.OTP_Id } });

    return res.status(200).json({ message: "OTP confirmado com sucesso." });
  } catch (error) {
    console.error("Erro ao confirmar OTP:", error);
    return res.status(500).json({ message: "Erro ao confirmar o código." });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const token = req.cookies.authcookie;
    if (!token) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    const decoded = verifyToken(token);
    const user_id = decoded.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    // Gera novo OTP e expiração
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Apaga OTPs antigos do utilizador
    await OTP.destroy({ where: { user_id } });

    // Cria novo OTP
    await OTP.create({
      user_id,
      OTPCode: hashedOTP,
      otpExpires: expiresAt,
    });

    // Envia o código por email
    await sendEmail(user.email, otpCode);

    return res.status(200).json({ message: "Novo código enviado para o email." });
  } catch (error) {
    console.error("Erro ao reenviar OTP:", error);
    return res.status(500).json({ message: "Erro ao reenviar o código." });
  }
};