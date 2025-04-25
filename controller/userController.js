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
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    return res.status(200).json({ profile: user });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return res.status(500).json({ message: "Erro interno ao buscar perfil" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body || {};

    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
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
    if (username) {
      user.username = username; // Só atualiza se o 'username' foi enviado
    }

    // Se há foto, atualiza o campo 'fotoUrl'
    if (req.file) {
      user.fotoUrl = `/userImg/${req.file.filename}`;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Perfil atualizado com sucesso", fotoUrl: user.fotoUrl });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return res.status(500).json({ message: "Erro interno ao atualizar perfil" });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    if (!user.fotoUrl) {
      return res
        .status(400)
        .json({ message: "Não há imagem de perfil para remover" });
    }

    const filePath = path.join("public", user.fotoUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.fotoUrl = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Imagem de perfil removida com sucesso" });
  } catch (err) {
    console.error("Erro ao remover imagem de perfil:", err);
    return res
      .status(500)
      .json({ message: "Erro interno ao remover imagem de perfil" });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: "Palavra-passe atual incorreta" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Palavra-passe atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar palavra-passe:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Palavra-passe incorreta" });

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

    return res.status(200).json({ message: "Conta eliminada com sucesso" });
  } catch (err) {
    console.error("Erro ao eliminar conta:", err);
    return res
      .status(500)
      .json({ message: "Erro interno ao eliminar conta" });
  }
};
