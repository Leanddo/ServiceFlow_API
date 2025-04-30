const express = require("express");
const router = express.Router();
const queuesController = require("../controller/queuesController");
const { requireAuth } = require("../middleware/authMiddleware");

// Inscrever um cliente em um serviço sem conta
router.post(
  "/services/:service_id/queues/owner",
  requireAuth,
  queuesController.addToQueueOwner
);

// Inscrever um cliente em um serviço
router.post(
  "/services/:service_id/queues",
  requireAuth,
  queuesController.addToQueue
);

// Atualizar o status de uma fila
router.patch(
  "/queues/:queue_id/status",
  requireAuth, // Middleware para autenticação
  queuesController.updateQueueStatus
);

// Listar a fila de um serviço
router.get(
  "/queues",
  requireAuth,
  queuesController.getQueues
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
