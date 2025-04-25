const express = require("express");
const router = express.Router();
const queuesController = require("../controller/queuesController");
const { requireAuth } = require("../middleware/authMiddleware");

// Inscrever um cliente em um serviço
router.post(
  "/services/:service_id/queues",
  requireAuth,
  queuesController.addToQueue
);

// Listar a fila de um serviço
router.get(
  "/services/:service_id/queues",
  requireAuth,
  queuesController.getQueueByService
);

// Cancelar inscrição de um cliente
router.delete(
  "/queues/:queue_id",
  requireAuth,
  queuesController.removeFromQueue
);

// Obter horários disponíveis para um serviço em uma data específica
router.get(
  "/services/:service_id/queues/available-times/:date",
  requireAuth,
  queuesController.getAvailableTimes
);

module.exports = router;