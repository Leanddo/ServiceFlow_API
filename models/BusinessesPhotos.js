const Sequelize = require("sequelize");
const db = require("../config/database");

const BusinessesPhotos = db.define("BusinessPhotos", {
  photo_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Businesses",
      key: "business_id",
    },
    onDelete: "CASCADE",
  },
  photo_url: {
    type: Sequelize.STRING,
    allowNull: false, 
  },
  description: {
    type: Sequelize.STRING, 
    allowNull: true,
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = { BusinessesPhotos };
