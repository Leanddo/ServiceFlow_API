const Sequelize = require("sequelize");
const db = require("../config/database");

const Professionals = db.define("Professionals", {
  professional_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  professional_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  professional_fotoUrl: {
    type: Sequelize.STRING,
  },
  availability: {
    type: Sequelize.JSON, // ou STRING se você preferir continuar com texto simples
    allowNull: false,
    defaultValue: [], // Exemplo: ["Segunda - 09:00 - 17:00", "Terça - 10:00 - 18:00"]
  },
  role: {
    type: Sequelize.ENUM("Owner", "Employee", "Assistant", "Other"),
    allowNull: false,
    defaultValue: "Funcionário",
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "active",
  },
  business_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "Businesses",
      key: "business_id",
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

module.exports = { Professionals };
