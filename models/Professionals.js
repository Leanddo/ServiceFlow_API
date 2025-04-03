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
  specialty: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  availability: {
    type: Sequelize.STRING,
    allowNull: false,
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

// Definindo as associações
Professionals.belongsTo(models.Business, {
  foreignKey: "business_id",
  onDelete: "CASCADE", // Se o negócio for excluído, o profissional também será excluído
});

Professionals.belongsTo(models.User, {
  foreignKey: "user_id",
  onDelete: "CASCADE", // Se o usuário for excluído, o profissional associado também será excluído
});

module.exports = { Professionals };
