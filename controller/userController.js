const { User } = require("../models/Users");
const { httpCode } = require("../utils/httpCodeHandler");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.user_id },
      attributes: ["username", "email", "fotoUrl", "role", "is_verified"],
    });

    if (!user) {
      return httpCode(404, { message: "Utilizador não encontrado" }, res);
    }

    return httpCode(200, { profile: user }, res);
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return httpCode(500, { message: "Erro interno ao buscar perfil" }, res);
  }
};
