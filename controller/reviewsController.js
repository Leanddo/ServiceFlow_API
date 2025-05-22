const { Reviews, Services, User, Queues, Businesses } = require("../models");
const {fn, col} = require("sequelize");

exports.addReview = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { review_title, review_body, review_rating } = req.body;

    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se o usuário tem uma inscrição na fila concluída para o serviço
    const completedQueue = await Queues.findOne({
      where: {
        service_id,
        user_id: req.user.user_id,
        status: "completed", // Certifique-se de que o status "completed" indica que a marcação foi executada
      },
    });

    if (!completedQueue) {
      return res.status(403).json({
        message:
          "Você só pode avaliar um serviço após a execução de sua marcação.",
      });
    }

    // Validar o rating
    if (review_rating < 1 || review_rating > 5) {
      return res
        .status(400)
        .json({ message: "A avaliação deve estar entre 1 e 5." });
    }

    // Criar a avaliação
    const newReview = await Reviews.create({
      review_title,
      review_body,
      review_rating,
      availability: "public", // Pode ser ajustado conforme necessário
      service_id,
      user_id: req.user.user_id, // Assumindo que o usuário está autenticado
    });

    res.status(201).json({
      message: "Avaliação criada com sucesso.",
      review: newReview,
    });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ message: "Erro ao criar avaliação.", error });
  }
};

exports.getServiceReviews = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { filter } = req.query; // Filtro opcional: "lowest", "highest", "recent"

    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Configurar a ordenação com base no filtro
    let order = [["createdAt", "DESC"]]; // Padrão: mais recentes
    if (filter === "lowest") {
      order = [["review_rating", "ASC"]]; // Menor rating
    } else if (filter === "highest") {
      order = [["review_rating", "DESC"]]; // Maior rating
    }

    // Buscar todas as avaliações do serviço com o filtro aplicado
    const reviews = await Reviews.findAll({
      where: { service_id },
      attributes: [
        "review_id",
        "review_title",
        "review_body",
        "review_rating",
        "user_id",
        "createdAt",
      ],
      include: [
        {
          model: User,
          attributes: ["username", "fotoUrl"], 
        },
      ],
      order,
    });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma avaliação encontrada para este serviço." });
    }

    // Calcular a média das avaliações do serviço
    const averageRating =
      reviews.reduce((sum, review) => sum + review.review_rating, 0) /
      reviews.length;

    res.status(200).json({
      service_name: service.service_name,
      average_rating: averageRating.toFixed(2),
      reviews,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações do serviço:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar avaliações do serviço.", error });
  }
};

exports.businessAverageRating = async (req, res) => {
  try {
    const { business_id } = req.params; // Obter o ID do negócio da URL

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Calcular a média geral das avaliações de todos os serviços do negócio
    const averageRatingData = await Reviews.findOne({
      attributes: [
        [fn("AVG", col("review_rating")), "average_rating"], // Média das avaliações
        [fn("COUNT", col("review_id")), "total_reviews"], // Total de avaliações
      ],
      include: [
        {
          model: Services,
          attributes: [], // Não precisamos de atributos dos serviços
          where: { business_id }, // Filtrar pelos serviços do negócio
        },
      ],
      raw: true, // Retornar os dados como um objeto simples
    });

    if (!averageRatingData || !averageRatingData.total_reviews) {
      return res
        .status(404)
        .json({ message: "Nenhuma avaliação encontrada para este negócio." });
    }

    const { average_rating, total_reviews } = averageRatingData;

    res.status(200).json({
      business_name: business.business_name,
      average_rating: average_rating ? parseFloat(average_rating).toFixed(2) : "0.00",
      total_reviews: parseInt(total_reviews, 10), // Total de avaliações
    });
  } catch (error) {
    console.error("Erro ao buscar média geral das avaliações do negócio:", error);
    res.status(500).json({
      message: "Erro ao buscar média geral das avaliações do negócio.",
      error,
    });
  }
};