const { verifyToken } = require("../utils/jwtUtils");
const { User } = require("../models/Users");

exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.authcookie;
  if (!token) return res.status(401).json({ message: "Não autenticado" });

  try {
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    if (!user.is_verified) {
      return res.status(401).json({ message: "Conta ainda não verificada" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
