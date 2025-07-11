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
exports.getPrivateProfessionalsByBusinessId = async (req, res) => {
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
        { model: Businesses, as: 'business', attributes: ["business_name"] },
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

exports.getPublicProfessionalsByBusinessId = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Validar se o business_id é um número
    if (isNaN(business_id)) {
      return res
        .status(400)
        .json({ message: "O ID do negócio fornecido é inválido." });
    }

    const professionals = await Professionals.findAll({
      where: { business_id, isActive: true },
      attributes: ["role", "availability"],
      include: [
        { model: User, attributes: ["username", "fotoUrl"] },
      ],
    });

    if (professionals.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum profissional encontrado para este negócio." });
    }

    res.status(200).json(professionals);
  } catch (error) {
    console.error("Erro ao buscar profissionais públicos por business_id:", error);
    res.status(500).json({ message: "Erro ao buscar profissionais", error });
  }
};

exports.getAllBusinessesByUser = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const professionals = await Professionals.findAll({
      where: { user_id },
      attributes: ['role'],
      include: [
        {
          model: Businesses,
          as: 'business',
          where: { isActive: true },
          attributes: ['business_id', 'business_name', 'main_photo_url', 'business_type'],
        },
      ],
    });

    if (professionals.length === 0) {
      return res.status(404).json({
        message: "Nenhum negócio encontrado para este usuário.",
      });
    }

    const result = professionals
      .map((prof) => {
        const business = prof.business?.get({ plain: true });
        if (!business) return null;

        return {
          ...business,
          role: prof.role,
        };
      })
      .filter(Boolean);

    res.status(200).json(result);

  } catch (error) {
    console.error("Erro ao buscar negócios públicos por user_id:", error);
    res.status(500).json({ message: "Erro ao buscar negócios", error });
  }
};

exports.createProfessional = async (req, res) => {
  try {
    // Recuperar os dados do corpo da requisição
    const { business_id } = req.params;
    const { availability, role, email, isActive } = req.body;

    // Validar campos obrigatórios
    if (!role || !business_id || !email || !availability) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios não preenchidos." });
    }

    // Validar o campo isActive
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "O campo 'isActive' deve ser true ou false." });
    }

    // Buscar o negócio
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res
        .status(404)
        .json({ message: "O negócio fornecido não existe." });
    }

    // Verificar se o profissional autenticado pertence ao mesmo negócio
    const authenticatedProfessional = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id },
    });

    if (!authenticatedProfessional) {
      return res.status(403).json({
        message: "Você só pode adicionar profissionais ao seu próprio negócio.",
      });
    }

    // Validar disponibilidade
    validateAvailability(availability);

    // Validar se os horários de disponibilidade estão dentro do horário de funcionamento do negócio
    const openingHour = business.opening_hour; // Hora de abertura do negócio
    const closingHour = business.closing_hour; // Hora de fechamento do negócio

    for (const slot of availability) {
      if (slot.start < openingHour || slot.end > closingHour) {
        return res.status(400).json({
          message: `Os horários de disponibilidade devem estar entre ${openingHour} e ${closingHour}.`,
        });
      }
    }

    // Verificar se o e-mail já está associado a um utilizador
    const existingUser = await User.findOne({ where: { email } });

    let emailSent = false;

    if (!existingUser) {
      // Enviar e-mail de convite
      const activationLink = `${process.env.HOST}/auth/login?email=${email}`;

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
    let existingProfessional = null;
    if (existingUser) {
      existingProfessional = await Professionals.findOne({
        where: {
          user_id: existingUser.user_id,
          business_id,
        },
      });
      if (existingProfessional) {
        return res.status(400).json({
          message: "Este utilizador já está associado a este negócio.",
        });
      }
    }

    // Criar o profissional associado ao utilizador existente
    const newProfessional = await Professionals.create({
      availability,
      role,
      business_id,
      email,
      user_id: existingUser ? existingUser.user_id : null,
      isActive: isActive !== undefined ? isActive : true, // Valor padrão: true
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
    const { id } = req.params;
    const { availability, role, isActive } = req.body;

    // Validar disponibilidade, se fornecida
    if (availability) {
      validateAvailability(availability);
    }

    // Validar o campo isActive, se fornecido
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "O campo 'isActive' deve ser true ou false." });
    }

    // Buscar o profissional que será atualizado
    const updateProfessional = await Professionals.findByPk(id);

    if (!updateProfessional) {
      return res.status(404).json({ message: "Profissional não encontrado." });
    }

    // Verificar se o profissional autenticado pertence ao mesmo negócio
    const authenticatedProfessional = await Professionals.findOne({
      where: { user_id: req.user.user_id },
    });

    if (
      !authenticatedProfessional ||
      updateProfessional.business_id !== authenticatedProfessional.business_id
    ) {
      return res.status(403).json({
        message: "Você só pode atualizar profissionais do seu próprio negócio.",
      });
    }

    // Atualizar o profissional
    await updateProfessional.update({
      availability,
      role,
      isActive, // Atualiza apenas se fornecido
    });

    res.status(200).json({ message: "Profissional atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    res.status(500).json({ message: "Erro ao atualizar profissional.", error });
  }
};

exports.deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar o profissional que será deletado
    const deleteProfessional = await Professionals.findByPk(id);

    if (!deleteProfessional) {
      return res.status(404).json({ message: "Profissional não encontrado." });
    }

    // Verificar se o profissional autenticado pertence ao mesmo negócio
    const authenticatedProfessional = await Professionals.findOne({
      where: { user_id: req.user.user_id },
    });

    if (
      !authenticatedProfessional ||
      deleteProfessional.business_id !== authenticatedProfessional.business_id
    ) {
      return res.status(403).json({
        message: "Você só pode deletar profissionais do seu próprio negócio.",
      });
    }

    // Deletar o profissional
    await deleteProfessional.destroy();

    res.status(200).json({ message: "Profissional deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    res.status(500).json({ message: "Erro ao deletar profissional", error });
  }
};
