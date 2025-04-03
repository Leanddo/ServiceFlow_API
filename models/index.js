const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const db = require("../config/database");

// Criando uma variável para armazenar todos os modelos
const models = {};

// Lendo todos os arquivos da pasta 'models'
fs.readdirSync(__dirname)
  .filter(file => file !== "index.js" && file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(db, Sequelize.DataTypes); // Carrega o modelo
    models[model.name] = model; // Armazena o modelo no objeto `models`
  });

// Definindo as associações (associando os modelos)
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models); // Se o modelo tiver um método `associate`, chama ele
  }
});

module.exports = models;
