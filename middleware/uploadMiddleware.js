const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `public/${folder}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de ficheiro inválido. Apenas imagens são permitidas."));
  }
};

const createUploadMiddleware = (folder, single = false) => {
  const upload = multer({
    storage: storage(folder),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  });

  return (req, res, next) => {
    const uploadHandler = single
      ? upload.single("foto")
      : upload.array("fotos", 5);

    uploadHandler(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

module.exports = createUploadMiddleware;
