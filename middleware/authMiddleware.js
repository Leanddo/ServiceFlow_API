const { verifyToken } = require("../utils/jwtUtils");

exports.requireAuth = (req, res, next) => {
  const token = req.cookies.authcookie;
  if (!token) return res.status(401).json({ message: "Não autenticado" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
