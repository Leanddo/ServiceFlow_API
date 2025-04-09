const Sequelize = require("sequelize");
const db = require("../config/database");
const {User} = require("./Users"); // importa o modelo User

const OTP = db.define("OTP", {
  OTP_Id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  OTPCode: {
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
  otpExpires: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

OTP.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

module.exports = { OTP };
