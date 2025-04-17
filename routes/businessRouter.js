const express = require("express");
const Router = express.Router();

const businessController = require("../controller/businessesController");

const { requireAuth } = require("../middleware/authMiddleware");
const createUploadMiddleware = require("../middleware/uploadMiddleware")

// Rotas públicas
Router.get("/business/", businessController.getAllBusinesses);
Router.get("/business/:id", businessController.getBusinessById);

// Rotas protegidas
Router.post("/business/", requireAuth, businessController.createBusiness); // Cria business e owner no Professional
Router.put(
  "/business/:business_id",
  requireAuth,
  businessController.updateBusiness
); // Só dono ou gerente pode atualizar
Router.put(
  "/business/:business_id/status",
  requireAuth,
  businessController.changeBusinessStatus
);// Só dono pode atualizar

Router.put(
  "/business/:business_id/photo",
  requireAuth,
  createUploadMiddleware("business"),
  businessController.updateBusinessPhoto
);

module.exports = Router;
