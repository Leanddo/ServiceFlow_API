const Sequelize = require("sequelize");
const db = require("../config/database");

const PasswordResetToken = db.define("PasswordResetToken", {
  token_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Nome da tabela Users
      key: "user_id", // Chave primária da tabela Users
    },
    onDelete: "CASCADE", // Excluir tokens se o usuário for excluído
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expires_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

module.exports = { PasswordResetToken };
