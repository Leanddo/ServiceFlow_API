const Sequelize = require("sequelize");
const db = require("../config/database");

const Notifications = db.define("Notifications", {
  notification_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  notification_message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  notification_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  notification_status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Users",
      key: "user_id",
    },
  },
});

module.exports = { Notifications };
