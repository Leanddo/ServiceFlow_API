const express = require("express");
const router = express.Router();
const reviewsController = require("../controller/reviewsController");
const { requireAuth } = require("../middleware/authMiddleware");

// Criar uma avaliação para um serviço
router.post(
  "/services/:service_id/reviews",
  requireAuth, // Middleware para autenticação
  reviewsController.addReview
);

// Buscar avaliações de um serviço específico com filtros opcionais
router.get(
  "/services/:service_id/reviews",
  reviewsController.getServiceReviews
);

// Obter todas as avaliações de um negócio
router.get(
  "/business/:business_id/reviews",
  reviewsController.getAllBusinessReviews
);

// Buscar a média de avaliações de todos os serviços
router.get(
  "/business/:business_id/average-rating",
  reviewsController.businessAverageRating
);

module.exports = router;