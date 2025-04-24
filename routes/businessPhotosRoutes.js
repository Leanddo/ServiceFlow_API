const express = require("express");
const router = express.Router();
const businessPhotosController = require("../controller/businessPhotosController");
const createUploadMiddleware = require("../middleware/uploadMiddleware");
const { requireAuth } = require("../middleware/authMiddleware");

router.get(
  "/businesses/:business_id/photos",
  businessPhotosController.getBusinessPhotos
);
// Adicionar uma nova foto a um negócio
router.post(
  "/businesses/:business_id/photos",
  requireAuth,
  createUploadMiddleware("business", false),
  businessPhotosController.addBusinessPhotos
);

router.delete(
  "/businesses/:business_id/photos/:photo_id",
  businessPhotosController.deleteBusinessPhoto
);

module.exports = router;
