const express = require("express");
const Router = express.Router();
const professionalsController = require("../controller/professionalsController");

// Rotas para profissionais
Router.get("/professionals/", professionalsController.getAllProfessionals); // Listar todos os profissionais
Router.get("/professionals/:id", professionalsController.getProfessionalById); // Obter um profissional por ID
Router.post("/professionals/", professionalsController.createProfessional); // Criar um novo profissional
Router.put("/professionals/:id", professionalsController.updateProfessional); // Atualizar um profissional existente
Router.delete("/professionals/:id", professionalsController.deleteProfessional); // Deletar um profissional

module.exports = Router;