const Sequelize = require("sequelize");
const db = require("../config/database");

const OTP = db.define("OTP", {
  OTP_Id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  OTPCode: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
  },
});

module.exports = { OTP };
