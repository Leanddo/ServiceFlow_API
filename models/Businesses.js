const Sequelize = require("sequelize");
const db = require("../config/database");

const Businesses = db.define("Businesses", {
  business_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_phone: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  business_email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = { Businesses };
