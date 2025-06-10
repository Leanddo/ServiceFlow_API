const { Services, Businesses } = require("../models/index");
const path = require("path");
const fs = require("fs");

// Criar um novo serviço
exports.createService = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { service_name, description, price, duration, category } = req.body;

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Criar o serviço
    const newService = await Services.create({
      business_id,
      service_name,
      description,
      price,
      duration,
      category,
    });

    res.status(201).json({
      message: "Serviço criado com sucesso.",
      service: newService,
    });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ message: "Erro ao criar serviço.", error });
  }
};

// Listar todos os serviços de um negócio
exports.getServices = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Obter os serviços do negócio
    const services = await Services.findAll({
      where: { business_id, isActive: true },
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).json({ message: "Erro ao buscar serviços.", error });
  }
};


// Listar todos os serviços de um negócio
exports.getServicesPrivate = async (req, res) => {
  try {
    const { business_id } = req.params;

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Obter os serviços do negócio
    const services = await Services.findAll({
      where: { business_id },
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).json({ message: "Erro ao buscar serviços.", error });
  }
};

// Obter um serviço específico
exports.getServiceById = async (req, res) => {
  try {
    const { business_id, service_id } = req.params;

    // Verificar se o serviço existe
    const service = await Services.findOne({
      where: { service_id, business_id, isActive: true },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ message: "Erro ao buscar serviço.", error });
  }
};

// Atualizar um serviço existente
exports.updateService = async (req, res) => {
  try {
    const { business_id, service_id } = req.params;
    const { service_name, description, price, duration, category } = req.body;

    // Verificar se o serviço existe
    const service = await Services.findOne({
      where: { service_id, business_id },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Atualizar os campos do serviço
    await service.update({
      service_name,
      description,
      price,
      duration,
      category,
    });

    res.status(200).json({ message: "Serviço atualizado com sucesso.", service });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ message: "Erro ao atualizar serviço.", error });
  }
};

// Excluir um serviço
exports.deleteService = async (req, res) => {
  try {
    const { business_id, service_id } = req.params;

    // Verificar se o serviço existe
    const service = await Services.findOne({
      where: { service_id, business_id },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Excluir o serviço
    await service.destroy();

    res.status(200).json({ message: "Serviço excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    res.status(500).json({ message: "Erro ao excluir serviço.", error });
  }
};

// Atualizar a foto de um serviço
exports.updateServicePhoto = async (req, res) => {
  const { service_id } = req.params;

  try {
    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se uma nova foto foi enviada
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma foto foi enviada." });
    }

    // Apagar a foto antiga, se existir
    if (service.service_fotoUrl) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public/serviceImg",
        path.basename(service.service_fotoUrl)
      );

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Erro ao apagar imagem antiga do serviço:", err.message);
        }
      });
    }

    // Atualizar o campo `service_fotoUrl` com a nova foto
    service.service_fotoUrl = `${process.env.API_HOST}/serviceImg/${req.file.filename}`;
    await service.save();

    res.status(200).json({
      message: "Foto do serviço atualizada com sucesso.",
      service_fotoUrl: service.service_fotoUrl,
    });
  } catch (error) {
    console.error("Erro ao atualizar foto do serviço:", error);
    res.status(500).json({ message: "Erro ao atualizar foto do serviço.", error });
  }
};

// Remover a foto de um serviço
exports.deleteServicePhoto = async (req, res) => {
  const { service_id } = req.params;

  try {
    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se há uma foto para remover
    if (!service.service_fotoUrl) {
      return res.status(400).json({ message: "Nenhuma foto para remover." });
    }

    // Apagar a foto
    const imagePath = path.join(
      __dirname,
      "..",
      "public/serviceImg",
      path.basename(service.service_fotoUrl)
    );

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn("Erro ao apagar imagem do serviço:", err.message);
      }
    });

    // Remover a referência à foto no banco de dados
    service.service_fotoUrl = null;
    await service.save();

    res.status(200).json({ message: "Foto do serviço removida com sucesso." });
  } catch (error) {
    console.error("Erro ao remover foto do serviço:", error);
    res.status(500).json({ message: "Erro ao remover foto do serviço.", error });
  }
};

// Alterar o status de um serviço
exports.changeServiceStatus = async (req, res) => {
  try {
    const { business_id, service_id } = req.params;
    const { isActive } = req.body;

    const service = await Services.findOne({
      where: { service_id, business_id },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    service.isActive = isActive;
    await service.save();

    res.status(200).json({
      message: `Serviço ${isActive ? "ativado" : "desativado"} com sucesso.`,
      service,
    });
  } catch (error) {
    console.error("Erro ao alterar status do serviço:", error);
    res.status(500).json({ message: "Erro ao alterar status do serviço.", error });
  }
};