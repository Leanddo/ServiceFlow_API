const express = require("express");
const router = express.Router();
const businessPhotosController = require("../controller/businessPhotosController");
const createUploadMiddleware = require("../middleware/uploadMiddleware");
const { requireAuth } = require("../middleware/authMiddleware");
const isOwnerOrManager = require("../middleware/isOwnerOrManagerMiddleware");

router.get(
  "/business/:business_id/photos",
  businessPhotosController.getBusinessPhotos
);
// Adicionar uma nova foto a um negócio
router.post(
  "/business/:business_id/photos",
  requireAuth,
  isOwnerOrManager,
  createUploadMiddleware("business", false),
  businessPhotosController.addBusinessPhotos
);

router.delete(
  "/business/:business_id/photos/:photo_id",
  requireAuth,
  isOwnerOrManager,
  businessPhotosController.deleteBusinessPhoto
);

module.exports = router;
