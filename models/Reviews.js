const Sequelize = require("sequelize");
const db = require("../config/database");

const Reviews = db.define("Reviews", {
  review_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  review_title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  review_body: {
    type: Sequelize.STRING,
  },
  review_rating: {
    type: Sequelize.DOUBLE,
  },
  availability: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  service_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Services",
      key: "service_id",
    },
  },
  user_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Users",
      key: "user_id",
    },
  },
});


module.exports = { Reviews };
