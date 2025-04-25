const express = require("express");
const router = express.Router();
const servicesController = require("../controller/servicesController");
const createUploadMiddleware = require("../middleware/uploadMiddleware");
const { requireAuth } = require("../middleware/authMiddleware");
const isOwnerOrManager = require("../middleware/isOwnerOrManagerMiddleware");

// Criar um novo serviço
router.post(
  "/businesses/:business_id/services",
  requireAuth,
  isOwnerOrManager,
  servicesController.createService
);

// Listar todos os serviços de um negócio
router.get("/businesses/:business_id/services", servicesController.getServices);

// Obter um serviço específico
router.get(
  "/businesses/:business_id/services/:service_id",
  servicesController.getServiceById
);

// Atualizar um serviço
router.put(
  "/businesses/:business_id/services/:service_id",
  requireAuth,
  isOwnerOrManager,
  servicesController.updateService
);

// Atualizar status um serviço
router.patch(
  "/businesses/:business_id/services/:service_id/status",
  requireAuth,
  isOwnerOrManager,
  servicesController.changeServiceStatus
);

// Excluir um serviço
router.delete(
  "/businesses/:business_id/services/:service_id",
  requireAuth,
  isOwnerOrManager,
  servicesController.deleteService
);

// Atualizar a foto de um serviço
router.put(
  "/businesses/:business_id/services/:service_id/photo",
  requireAuth,
  isOwnerOrManager,
  createUploadMiddleware("serviceImg", true), // Middleware para upload de uma única foto
  servicesController.updateServicePhoto
);

// Remover a foto de um serviço
router.delete(
  "/businesses/:business_id/services/:service_id/photo",
  requireAuth,
  isOwnerOrManager,
  servicesController.deleteServicePhoto
);

module.exports = router;
