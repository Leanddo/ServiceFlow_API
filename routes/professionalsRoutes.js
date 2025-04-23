const express = require("express");
const Router = express.Router();
const professionalsController = require("../controller/professionalsController");
const { requireAuth } = require("../middleware/authMiddleware");

// Rotas para profissionais
Router.get("/professionals/", professionalsController.getAllProfessionals); // Listar todos os profissionais
Router.get(
  "/professionals/:business_id",
  professionalsController.getProfessionalsByBusinessId
); // Obter um profissional por Business ID

Router.post(
  "/professionals/:business_id",
  requireAuth,
  professionalsController.createProfessional
); // Criar um novo profissional
Router.put(
  "/professionals/:id",
  requireAuth,
  professionalsController.updateProfessional
); // Atualizar um profissional existente
Router.delete(
  "/professionals/:id",
  requireAuth,
  professionalsController.deleteProfessional
); // Deletar um profissional

module.exports = Router;
