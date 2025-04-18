const { Professionals, Businesses, User } = require("../models/index");
const { validateAvailability } = require("../utils/validationUtils");

// Listar todos os profissionais
exports.getAllProfessionals = async (req, res) => {
    try {
      const professionals = await Professionals.findAll({
        include: [
          { model: Businesses, attributes: ["business_name"] },
          { model: User, attributes: ["username", "email", "fotoUrl"] }, // Inclui o campo fotoUrl
        ],
      });
      res.status(200).json(professionals);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      res.status(500).json({ message: "Erro ao buscar profissionais", error });
    }
  };

// Obter um profissional por ID
exports.getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const professional = await Professionals.findByPk(id, {
      include: [
        { model: Businesses, attributes: ["business_name"] },
        { model: User, attributes: ["username", "email"] },
      ],
    });

    if (!professional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    res.status(200).json(professional);
  } catch (error) {
    console.error("Erro ao buscar profissional:", error);
    res.status(500).json({ message: "Erro ao buscar profissional", error });
  }
};

exports.createProfessional = async (req, res) => {
  try {
    // Verificar se o usuário autenticado é "Owner"
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id: req.body.business_id },
    });

    if (!professional || professional.role !== "Owner") {
      return res.status(403).json({
        message: "Apenas o proprietário pode adicionar profissionais.",
      });
    }

    // Recuperar os dados do corpo da requisição
    const { professional_name, availability, role, business_id, email } =
      req.body;

    validateAvailability(availability);
    // Verificar se os campos obrigatórios foram preenchidos
    if (
      !role ||
      !business_id ||
      !email ||
      !availability
    ) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios não preenchidos." });
    }

    // Verificar se o e-mail já está associado a um utilizador
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({
        message: "O utilizador com este e-mail ainda não criou uma conta.",
      });
    }

    // Verificar se o utilizador já está associado a este negócio
    const existingProfessional = await Professionals.findOne({
      where: { user_id: existingUser.user_id, business_id },
    });

    if (existingProfessional) {
      return res.status(400).json({
        message: "Este utilizador já está associado a este negócio.",
      });
    }

    // Criar o profissional associado ao utilizador existente
    const newProfessional = await Professionals.create({
      professional_name,
      availability,
      role,
      business_id,
      user_id: existingUser.user_id, // Associar ao utilizador existente
    });

    res.status(201).json({
      message: "Profissional adicionado com sucesso.",
      professional: newProfessional,
    });
  } catch (error) {
    console.error("Erro ao criar profissional:", error);
    res.status(500).json({ message: "Erro ao criar profissional", error });
  }
};

// Atualizar um profissional existente
exports.updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { professional_name, availability, role, status } = req.body;

    const professional = await Professionals.findByPk(id);

    if (!professional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    await professional.update({
      professional_name,
      availability,
      role,
      status,
    });

    res.status(200).json({ message: "Profissional atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    res.status(500).json({ message: "Erro ao atualizar profissional", error });
  }
};

// Deletar um profissional
exports.deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await Professionals.findByPk(id);

    if (!professional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    await professional.destroy();
    res.status(200).json({ message: "Profissional deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    res.status(500).json({ message: "Erro ao deletar profissional", error });
  }
};
