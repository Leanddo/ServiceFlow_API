const express = require("express");
const Router = express.Router();

const businessController = require("../controller/businessesController");

const { requireAuth } = require("../middleware/authMiddleware");
const createUploadMiddleware = require("../middleware/uploadMiddleware");
const isOwnerOrManager = require("../middleware/isOwnerOrManagerMiddleware");

// Rotas públicas
Router.get("/business/", businessController.getAllBusinesses);
Router.get("/business/:id", businessController.getBusinessById);

// Verificar se o usuário é o proprietário do negócio
Router.get(
  "/business/:business_id/is-owner",
  requireAuth,
  businessController.isBusinessOwner
);


// Verificar se o usuário é o proprietário do negócio
Router.get(
  "/business/:business_id/is-professional",
  requireAuth,
  businessController.isBusinessProfessional
);

// Rotas protegidas
Router.post(
  "/business/",
  requireAuth,
  businessController.createBusiness
); // Cria business e owner no Professional
Router.put(
  "/business/:business_id",
  requireAuth,
  isOwnerOrManager,
  businessController.updateBusiness
); // Só dono ou gerente pode atualizar
Router.put(
  "/business/:business_id/status",
  requireAuth,
  isOwnerOrManager,
  businessController.changeBusinessStatus
); // Só dono pode atualizar

Router.put(
  "/business/:business_id/photo",
  requireAuth,
  isOwnerOrManager,
  createUploadMiddleware("business"),
  businessController.updateBusinessPhoto
);

module.exports = Router;
