const express = require("express");
const Router = express.Router();
const businessController = require("../controller/businessesController");
const { requireAuth } = require("../middleware/authMiddleware");

// Rotas públicas
Router.get("/business/", businessController.getAllBusinesses);
Router.get("/business/:id", businessController.getBusinessById);

// Rotas protegidas
Router.post("/business/", requireAuth, businessController.createBusiness); // Cria business e owner no Professional
Router.put("/business/:business_id", requireAuth, businessController.updateBusiness); // Só dono ou gerente pode atualizar
Router.delete(
  "/business/:id",
  requireAuth,
  businessController.deleteBusiness
); 

module.exports = Router;
