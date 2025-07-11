const { Businesses, Professionals, User } = require("../models/index");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

exports.createBusiness = async (req, res) => {
  const {
    business_name,
    business_address,
    business_type,
    business_phone,
    business_email,
    description,
    isActive,
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

    const user = await User.findByPk(req.user.user_id);
    if (!user || !user.email) {
      return res.status(400).json({ message: "Usuário autenticado não possui um e-mail válido." });
    }

    const newBusiness = await Businesses.create({
      business_name,
      business_address,
      business_type,
      business_phone,
      business_email,
      description,
      isActive,
    });

    await Professionals.create({
      user_id: req.user.user_id,
      business_id: newBusiness.business_id,
      role: "Owner",
      email: user.email, // Usar o e-mail do usuário autenticado
      availability: "Full-time", // Disponibilidade padrão
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

    filter.isActive = true;

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
    const business = await Businesses.findOne({
      where: {
        business_id: id,
        isActive: true,
      },
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
  const { business_id } = req.params;

  const {
    business_name,
    business_address,
    business_type,
    business_phone,
    business_email,
    description,
  } = req.body;

  try {
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Verificar se o usuário autenticado pertence ao negócio
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id },
    });

    if (!professional) {
      return res.status(403).json({
        message: "Você não tem permissão para atualizar este negócio.",
      });
    }

    const updatedBusiness = await business.update({
      business_name,
      business_address,
      business_phone,
      business_email,
      business_type,
      description,
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

exports.isBusinessOwner = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Verificar se o usuário autenticado é o proprietário do negócio
    const professional = await Professionals.findOne({
      where: {
        user_id: req.user.user_id, // ID do usuário autenticado
        business_id, // ID do negócio
        role: "Owner", // Apenas o proprietário
      },
    });

    if (!professional) {
      return res.status(200).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    console.error("Erro ao verificar proprietário do negócio:", error);
    res.status(500).json({
      message: "Erro interno ao verificar o proprietário do negócio.",
      error,
    });
  }
};

exports.isBusinessProfessional = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Verificar se o usuário autenticado é o proprietário do negócio
    const professional = await Professionals.findOne({
      where: {
        user_id: req.user.user_id, // ID do usuário autenticado
        business_id, // ID do negócio
      },
    });

    if (!professional) {
      return res.status(200).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    console.error("Erro ao verificar proprietário do negócio:", error);
    res.status(500).json({
      message: "Erro interno ao verificar o proprietário do negócio.",
      error,
    });
  }
};

exports.changeBusinessStatus = async (req, res) => {
  const { business_id } = req.params;
  const { isActive } = req.body;

  try {
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    business.isActive = isActive;
    await business.save();

    res
      .status(200)
      .json({ message: "Estado do negócio atualizado com sucesso." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao alterar o estado do negócio.", error });
  }
};

exports.updateBusinessPhoto = async (req, res) => {
  const { business_id } = req.params;

  try {
    const business = await Businesses.findByPk(business_id);

    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    console.log(req.file);

    // Verifica se tem uma imagem antiga e apaga
    if (req.file && business.main_photo_url) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public/business",
        path.basename(business.main_photo_url)
      );

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Erro ao apagar imagem antiga do negócio:", err.message);
        }
      });
    }

    // Atualiza com nova imagem
    if (req.file) {
      business.main_photo_url = `${process.env.API_HOST}/business/${req.file.filename}`;
      await business.save();
    }

    return res.status(200).json({
      message: "Imagem do negócio atualizada com sucesso.",
      photoUrl: business.main_photo_url,
    });
  } catch (err) {
    console.error("Erro ao atualizar imagem do negócio:", err);
    return res
      .status(500)
      .json({ message: "Erro interno ao atualizar a imagem do negócio." });
  }
};
