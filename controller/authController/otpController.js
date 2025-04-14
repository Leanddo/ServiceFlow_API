const bcrypt = require("bcrypt");
const { User,OTP } = require("../../models/index");
const { verifyToken } = require("../../utils/jwtUtils");
const sendEmail = require("../../utils/emailSender");
const {httpCode} = require("../../utils/httpCodeHandler")

exports.ConfirmOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return httpCode(400, { message: "Código OTP é obrigatório."}, res);

    }

    const token = req.cookies.authcookie;
    if (!token) {
      return httpCode(401, { message: "Não autenticado." }, res);
    }

    const decoded = verifyToken(token);
    const user_id = decoded.user_id;

    const otpRecord = await OTP.findOne({
      where: { user_id },
      order: [['otpExpires', 'DESC']],
    });

    if (!otpRecord) {
      return httpCode(400, { message: "Nenhum código encontrado." }, res);
    }

    const now = new Date();
    if (now > new Date(otpRecord.otpExpires)) {
      // Apaga o OTP se tiver expirado
      await OTP.destroy({ where: { OTP_Id: otpRecord.OTP_Id } });
      return httpCode(400, { message: "O código expirou. Solicite um novo." }, res);
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.OTPCode.toString());

    if (!isMatch) {
      return httpCode(400, { message: "Código de autenticação inválido." }, res);
    }

    await User.update({ is_verified: true }, { where: { user_id } });
    await OTP.destroy({ where: { OTP_Id: otpRecord.OTP_Id } });

    return httpCode(200, { message: "OTP confirmado com sucesso." }, res);
  } catch (error) {
    console.error("Erro ao confirmar OTP:", error);
    return httpCode(500, { message: "Erro ao confirmar o código." }, res);
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const token = req.cookies.authcookie;
    if (!token) {
      return httpCode(401, { message: "Não autenticado." }, res);
    }

    const decoded = verifyToken(token);
    const user_id = decoded.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
      return httpCode(404, { message: "Utilizador não encontrado." }, res);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await OTP.destroy({ where: { user_id } });

    await OTP.create({
      user_id,
      OTPCode: hashedOTP,
      otpExpires: expiresAt,
    });

    await sendEmail(user.email, otpCode);

    return httpCode(404, { message: "Novo código enviado para o email." }, res);
  } catch (error) {
    console.error("Erro ao reenviar OTP:", error);
    return httpCode(500, { message: "Erro ao reenviar o código." }, res);
  }
};