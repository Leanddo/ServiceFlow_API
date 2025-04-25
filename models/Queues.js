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
  queue_date: {
    type: Sequelize.DATE,
    allowNull: false, // Data e hora do serviço
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
  professional_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Professionals",
      key: "professional_id",
    },
  },
});

module.exports = { Queues };
