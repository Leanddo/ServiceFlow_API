const express = require("express");
const Router = express.Router();
const professionalsController = require("../controller/professionalsController");
const { requireAuth } = require("../middleware/authMiddleware");
const isOwnerOrManager = require("../middleware/isOwnerOrManagerMiddleware");

// Listar todos os profissionais (com paginação ou filtros, se necessário)
Router.get(
  "/professionals",
  requireAuth,
  professionalsController.getAllProfessionals
);

// Obter todos os profissionais de um negócio privado
Router.get(
  "/business/:business_id/professionals/private",
  requireAuth,
  professionalsController.getPrivateProfessionalsByBusinessId
);

// Obter todos os profissionais de um negócio publico
Router.get(
  "/business/:business_id/professionals/public",
  professionalsController.getPublicProfessionalsByBusinessId
);

// Criar um novo profissional para um negócio
Router.post(
  "/business/:business_id/professionals",
  requireAuth,
  isOwnerOrManager,
  professionalsController.createProfessional
);

// Atualizar um profissional existente
Router.put(
  "/professionals/:id",
  requireAuth,
  isOwnerOrManager,
  professionalsController.updateProfessional
);

// Deletar um profissional
Router.delete(
  "/professionals/:id",
  requireAuth,
  isOwnerOrManager,
  professionalsController.deleteProfessional
);

module.exports = Router;
