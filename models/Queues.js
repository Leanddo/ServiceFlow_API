const Sequelize = require("sequelize");
const db = require("../config/database");

const Queues = db.define("Queues", {
  queue_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  queue_position: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  queue_estimate_wait_time: {
    type: Sequelize.TIME,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Users",
      key: "user_id",
    },
  },
  service_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Services",
      key: "service_id",
    },
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
Queues.belongsTo(models.User, {
  foreignKey: "user_id",
  onDelete: "CASCADE", // Se o usuário for excluído, a fila também será excluída
});

Queues.belongsTo(models.Service, {
  foreignKey: "service_id",
  onDelete: "CASCADE", // Se o serviço for excluído, a fila também será excluída
});

Queues.belongsTo(models.Business, {
  foreignKey: "business_id",
  onDelete: "CASCADE", // Se o negócio for excluído, a fila também será excluída
});

module.exports = { Queues };
