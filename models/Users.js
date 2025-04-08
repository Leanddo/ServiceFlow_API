const Sequelize = require("sequelize");
const db = require("../config/database");

const User = db.define("Users", {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
  },
  fotoUrl: {
    type: Sequelize.STRING,
  },
  role: {
    type: Sequelize.STRING,
    defaultValue: "user",
  },
  google_Id: {
    type: Sequelize.STRING,
    unique: true,
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = { User };
