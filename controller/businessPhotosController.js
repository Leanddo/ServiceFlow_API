const { Businesses, BusinessesPhotos } = require("../models/index");
require("dotenv").config();

exports.getBusinessPhotos = async (req, res) => {
  try {
    const { business_id } = req.params;

    const photos = await BusinessesPhotos.findAll({
      where: { business_id },
    });

    if (photos.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma foto encontrada para este negócio." });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Erro ao buscar fotos do negócio:", error);
    res.status(500).json({ message: "Erro ao buscar fotos do negócio", error });
  }
};

exports.addBusinessPhotos = async (req, res) => {
  try {
    const { business_id } = req.params;
    const { description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Nenhuma foto foi enviada." });
    }

    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    console.log("FILES RECEBIDOS:", req.files);

    const photos = await Promise.all(
      req.files.map((file) =>
        BusinessesPhotos.create({
          business_id,
          photo_url: `${process.env.API_HOST}/public/business/${file.filename}`,
          description,
        })
      )
    );

    res.status(201).json({
      message: "Fotos adicionadas com sucesso.",
      photos,
    });
  } catch (error) {
    console.error("Erro ao adicionar fotos ao negócio:", error);
    res
      .status(500)
      .json({ message: "Erro ao adicionar fotos ao negócio", error });
  }
};

exports.deleteBusinessPhoto = async (req, res) => {
  try {
    const { business_id, photo_id } = req.params;

    const photo = await BusinessesPhotos.findOne({
      where: { business_id, photo_id },
    });

    if (!photo) {
      return res.status(404).json({ message: "Foto não encontrada." });
    }

    await photo.destroy();

    res.status(200).json({ message: "Foto deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar foto do negócio:", error);
    res.status(500).json({ message: "Erro ao deletar foto do negócio", error });
  }
};
