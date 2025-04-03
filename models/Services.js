const Sequelize = require("sequelize");
const db = require("../config/database");

const Services = db.define("Services", {
  service_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  service_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  duration: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Businesses",
      key: "business_id",
    },
  },
});

// Definindo as associações
Services.belongsTo(models.Business, {
  foreignKey: "business_id",
  onDelete: "CASCADE", // Se o negócio for excluído, os serviços associados também serão excluídos
});

Services.hasMany(models.Review, {
  foreignKey: "service_id",
  onDelete: "CASCADE", // Se o serviço for excluído, as avaliações associadas também serão excluídas
});

Services.hasMany(models.Queue, {
  foreignKey: "service_id",
  onDelete: "CASCADE", // Se o serviço for excluído, as filas associadas também serão excluídas
});

module.exports = { Services };
