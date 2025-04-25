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
  service_fotoUrl: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  duration: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 30,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  business_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Businesses",
      key: "business_id",
    },
  },
});

module.exports = { Services };
