const { Professionals, Businesses } = require("../models/index");

const isOwnerOrManager = async (req, res, next) => {
  try {
    const { business_id } = req.params;

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Buscar o profissional associado ao usuário autenticado
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id },
    });

    if (!professional) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    // Verificar se o profissional é Owner ou Manager
    if (!["Owner", "Manager"].includes(professional.role)) {
      return res.status(403).json({
        message: "Não tem permissão para realizar esta ação.",
      });
    }

    // Usuário é Owner ou Manager, continuar para a próxima função
    next();
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);
    res.status(500).json({ message: "Erro ao verificar permissões.", error });
  }
};

module.exports = isOwnerOrManager;