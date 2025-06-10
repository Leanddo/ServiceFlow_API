const multer = require("multer"); 
const path = require("path"); 
const fs = require("fs"); 

// Configuração do armazenamento para os arquivos enviados
const storage = (folder) =>
  multer.diskStorage({
    // Define o destino onde os arquivos serão armazenados
    destination: (req, file, cb) => {
      const dir = `public/${folder}/`; // Diretório onde os arquivos serão salvos
      if (!fs.existsSync(dir)) {
        // Verifica se o diretório existe
        fs.mkdirSync(dir, { recursive: true }); // Cria o diretório se não existir
      }
      cb(null, dir); // Define o diretório como destino
    },
    // Define o nome do arquivo salvo
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Gera um sufixo único
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Adiciona a extensão original do arquivo
    },
  });

// Filtro para validar os tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/; // Tipos de arquivos permitidos
  const ext = path.extname(file.originalname).toLowerCase(); // Obtém a extensão do arquivo
  if (allowedTypes.test(ext)) {
    // Verifica se a extensão é permitida
    cb(null, true); // Aceita o arquivo
  } else {
    // Rejeita o arquivo com uma mensagem de erro
    cb(new Error("Tipo de ficheiro inválido. Apenas imagens são permitidas."));
  }
};

// Função para criar o middleware de upload
const createUploadMiddleware = (folder, single = true) => {
  const upload = multer({
    storage: storage(folder), // Configuração de armazenamento
    fileFilter, // Filtro de tipos de arquivos
    limits: { fileSize: 20 * 1024 * 1024 }, // Limite de tamanho do arquivo (20 MB)
  });

  // Retorna o middleware de upload
  return (req, res, next) => {
    // Define se o upload será de um único arquivo ou múltiplos arquivos
    const uploadHandler = single
      ? upload.single("foto") // Upload de um único arquivo com o campo "foto"
      : upload.array("fotos", 5); // Upload de até 5 arquivos com o campo "fotos"

    // Executa o upload e trata erros
    uploadHandler(req, res, function (err) {
      if (err) {
        // Retorna um erro caso ocorra
        return res.status(400).json({ message: err.message });
      }
      next(); // Continua para o próximo middleware ou controlador
    });
  };
};

module.exports = createUploadMiddleware; // Exporta a função para ser usada em outros arquivos
