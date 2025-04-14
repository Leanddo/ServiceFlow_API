const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const {
  User,
  Queues,
  Reviews,
  Notification,
  Professionals,
  OTP,
} = require("../models/index");

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

    return httpCode(200, { message: "Perfil atualizado com sucesso" }, res);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return httpCode(500, { message: "Erro interno ao atualizar perfil" }, res);
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return httpCode(404, { message: "Utilizador não encontrado" }, res);
    }

    if (!user.fotoUrl) {
      return httpCode(
        400,
        { message: "Não há imagem de perfil para remover" },
        res
      );
    }

    const filePath = path.join("public", user.fotoUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.fotoUrl = null;
    await user.save();

    return httpCode(
      200,
      { message: "Imagem de perfil removida com sucesso" },
      res
    );
  } catch (err) {
    console.error("Erro ao remover imagem de perfil:", err);
    return httpCode(
      500,
      { message: "Erro interno ao remover imagem de perfil" },
      res
    );
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user)
      return httpCode(404, { message: "Utilizador não encontrado" }, res);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch)
      return httpCode(400, { message: "Palavra-passe atual incorreta" }, res);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return httpCode(
      200,
      { message: "Palavra-passe atualizada com sucesso" },
      res
    );
  } catch (err) {
    console.error("Erro ao atualizar palavra-passe:", err);
    return httpCode(500, { message: "Erro interno" }, res);
  }
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user)
      return httpCode(404, { message: "Utilizador não encontrado" }, res);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return httpCode(401, { message: "Palavra-passe incorreta" }, res);

    if (user.fotoUrl) {
      const imgPath = path.join(
        __dirname,
        "..",
        "public",
        "userImg",
        path.basename(user.fotoUrl)
      );
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Queues.destroy({ where: { user_id: user.user_id } });
    await Reviews.destroy({ where: { user_id: user.user_id } });
    await Notification.destroy({ where: { user_id: user.user_id } });
    await Professionals.destroy({ where: { user_id: user.user_id } });
    await OTP.destroy({ where: { user_id: user.user_id } });
    await user.destroy();

    return httpCode(200, { message: "Conta eliminada com sucesso" }, res);
  } catch (err) {
    console.error("Erro ao eliminar conta:", err);
    return httpCode(500, { message: "Erro interno ao eliminar conta" }, res);
  }
};
