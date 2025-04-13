const fs = require("fs");
const path = require("path");

const { User } = require("../models/Users");
const { httpCode } = require("../utils/httpCodeHandler");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.user_id },
      attributes: ["username", "email", "fotoUrl", "role"],
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

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return httpCode(404, { message: "Utilizador não encontrado" }, res);
    }

    // Se há nova imagem e já existe uma antiga, apaga a antiga
    if (req.file && user.fotoUrl) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public/userImg",
        path.basename(user.fotoUrl)
      );

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Erro ao apagar imagem antiga:", err.message);
        }
      });
    }

    // Atualiza os campos
    user.username = username || user.username;
    if (req.file) {
      user.fotoUrl = `/userImg/${req.file.filename}`;
    }

    await user.save();

    return httpCode(
      200,
      { message: "Perfil atualizado com sucesso"},
      res
    );
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return httpCode(500, { message: "Erro interno ao atualizar perfil" }, res);
  }
};
