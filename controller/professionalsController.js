const path = require("path");
const sendEmail = require("../utils/emailSender");

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
exports.getProfessionalsByBusinessId = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Validar se o business_id é um número
    if (isNaN(business_id)) {
      return res
        .status(400)
        .json({ message: "O ID do negócio fornecido é inválido." });
    }

    const professionals = await Professionals.findAll({
      where: { business_id },
      include: [
        { model: Businesses, attributes: ["business_name"] },
        { model: User, attributes: ["username", "email", "fotoUrl"] },
      ],
    });

    if (professionals.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum profissional encontrado para este negócio." });
    }

    res.status(200).json(professionals);
  } catch (error) {
    console.error("Erro ao buscar profissionais por business_id:", error);
    res.status(500).json({ message: "Erro ao buscar profissionais", error });
  }
};

exports.createProfessional = async (req, res) => {
  try {
    // Verificar se o usuário autenticado é "Owner"
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!professional || professional.role !== "Owner") {
      return res.status(403).json({
        message: "Apenas o proprietário pode adicionar profissionais.",
      });
    }

    // Recuperar os dados do corpo da requisição
    const { business_id } = req.params;
    const { availability, role, email } = req.body;

    console.log(business_id, professional.business_id);

    if (business_id === !professional.business_id) {
      return res.status(403).json({
        message: "Você só pode adicionar profissionais ao seu próprio negócio.",
      });
    }

    // Validar campos obrigatórios
    if (!role || !business_id || !email || !availability) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios não preenchidos." });
    }

    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res
        .status(404)
        .json({ message: "O negócio fornecido não existe." });
    }

    // Validar disponibilidade
    validateAvailability(availability);

    // Verificar se o e-mail já está associado a um utilizador
    const existingUser = await User.findOne({ where: { email } });

    let emailSent = false;

    if (!existingUser) {
      // Enviar e-mail de convite
      const activationLink = `http://localhost:3000/register?email=${email}`;

      const placeholders = {
        PROFESSIONAL_NAME: "Convidado", // Nome genérico, pois o utilizador ainda não existe
        BUSINESS_NAME: business.business_name, // Nome do negócio
        ROLE: role, // Papel do profissional
        REGISTRATION_LINK: activationLink, // Link de registro
      };

      await sendEmail({
        to: email,
        subject: "Convite para criar uma conta no ServiceFlow",
        templatePath: path.join(
          __dirname,
          "../templates/inviteProfessionalTemplate.html"
        ),
        placeholders,
      });

      emailSent = true; // Marcar que o e-mail foi enviado
    }

    // Verificar se o utilizador já está associado a este negócio
    const existingProfessional = await Professionals.findOne({
      where: {
        user_id: existingUser ? existingUser.user_id : null,
        business_id,
      },
    });

    if (existingProfessional) {
      return res.status(400).json({
        message: "Este utilizador já está associado a este negócio.",
      });
    }

    // Criar o profissional associado ao utilizador existente
    const newProfessional = await Professionals.create({
      availability,
      role,
      business_id,
      email,
      user_id: existingUser ? existingUser.user_id : null, // Associa ao utilizador existente ou deixa como null
    });

    const successMessage = emailSent
      ? "Profissional adicionado com sucesso, mas o utilizador ainda não tem conta. Um e-mail foi enviado."
      : "Profissional adicionado com sucesso.";

    res.status(201).json({
      message: successMessage,
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
    // Verificar se o usuário autenticado é "Owner"
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!professional || professional.role !== "Owner") {
      return res.status(403).json({
        message: "Apenas o proprietário pode adicionar profissionais.",
      });
    }
    const { id } = req.params;
    const { availability, role, status } = req.body;

    validateAvailability(availability);

    const updateProfessional = await Professionals.findByPk(id);

    if (!updateProfessional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    console.log(updateProfessional.business_id == professional.business_id);

    // Verificar se o profissional pertence ao mesmo negócio
    if (updateProfessional.business_id !== professional.business_id) {
      return res.status(403).json({
        message: "Você só pode atualizar profissionais do seu próprio negócio.",
      });
    }

    // Validar disponibilidade, se fornecida
    if (availability) {
      validateAvailability(availability);
    }

    await updateProfessional.update({
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
    // Verificar se o usuário autenticado é "Owner"
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!professional || professional.role !== "Owner") {
      return res.status(403).json({
        message: "Apenas o proprietário pode adicionar profissionais.",
      });
    }

    const { id } = req.params;

    const deleteProfessional = await Professionals.findByPk(id);

    if (!deleteProfessional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    await deleteProfessional.destroy();
    res.status(200).json({ message: "Profissional deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    res.status(500).json({ message: "Erro ao deletar profissional", error });
  }
};