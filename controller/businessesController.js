const { Businesses, Professionals } = require("../models/index");
const { Op } = require("sequelize");

exports.createBusiness = async (req, res) => {
  const {
    business_name,
    business_address,
    business_type,
    business_phone,
    business_email,
    description,
  } = req.body;

  // Validação de campos obrigatórios
  if (
    !business_name ||
    !business_address ||
    !business_type ||
    !business_phone ||
    !business_email
  ) {
    return res.status(400).json({
      message:
        "Todos os campos obrigatórios devem ser preenchidos: name, address, type, phone e email.",
    });
  }

  try {
    const existingBusiness = await Businesses.findOne({
      where: {
        business_name,
        business_email,
      },
    });

    if (existingBusiness) {
      return res.status(409).json({
        message: "Já existe um negócio com este nome e e-mail.",
      });
    }

    const newBusiness = await Businesses.create({
      business_name,
      business_address,
      business_type,
      business_phone,
      business_email,
      description,
    });

    await Professionals.create({
      professional_name: "Owner",
      specialty: "Administração",
      availability: "Full-time",
      business_id: newBusiness.business_id,
      user_id: req.user.user_id,
      role: "Owner",
    });

    res.status(201).json(newBusiness);
  } catch (error) {
    console.error("Erro ao criar o negócio:", error);
    res.status(500).json({
      message:
        "Erro ao criar o negócio. Verifica se todos os campos estão corretos.",
      error: error.message || error,
    });
  }
};

exports.getAllBusinesses = async (req, res) => {
  const { name, business_type } = req.query;

  try {
    const filter = {};

    // Se o parâmetro "name" for passado, adiciona ao filtro
    if (name) {
      filter.business_name = { [Op.iLike]: `%${name}%` }; // Usamos iLike para busca case-insensitive
    }

    // Se o parâmetro "business_type" for passado, adiciona ao filtro
    if (business_type) {
      filter.business_type = business_type;
    }

    const businesses = await Businesses.findAll({
      where: filter,
      include: ["photos"],
    });

    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar negócios", error });
  }
};

exports.getBusinessById = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Businesses.findByPk(id, {
      include: ["photos"],
    });

    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado" });
    }

    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o negócio", error });
  }
};

exports.updateBusiness = async (req, res) => {
  const { business_id } = req.params; // ID do negócio que queremos atualizar

  const {
    business_name,
    business_address,
    business_type,
    business_phone,
    business_email,
    description
  } = req.body;

  try {
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    const businessOwnerOrManager = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id: business_id },
    });
    if (!businessOwnerOrManager) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    if (!["Owner", "Manager"].includes(businessOwnerOrManager.role)) {
      return res
        .status(403)
        .json({ message: "Não tem permissão para atualizar este negócio." });
    }


    // Atualizar o negócio
    const updatedBusiness = await business.update({
      business_name,
      business_address,
      business_phone,
      business_email,
      business_type,
      description
    });

    res.status(200).json({
      message: "Negócio atualizado com sucesso.",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar o negócio.", error });
  }
};

exports.deleteBusiness = async (req, res) => {
  const { businessId } = req.params;

  try {
    const deleted = await Business.destroy({
      where: { business_id: businessId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Negócio não encontrado" });
    }

    res.status(200).json({ message: "Negócio apagado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao apagar negócio", error });
  }
};
