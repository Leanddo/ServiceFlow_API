const db = require("../config/database");

// Importar modelos
const { User } = require("./Users");
const { Services } = require("./Services");
const { Reviews } = require("./Reviews");
const { Queues } = require("./Queues");
const { Businesses } = require("./Businesses");
const { Professionals } = require("./Professionals");
const { OTP } = require("./OTP");
const { Notifications } = require("./Notifications");

// Relacionamentos

// Reviews
Reviews.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Reviews.belongsTo(Services, { foreignKey: "service_id", onDelete: "CASCADE" });

// Queues
Queues.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Queues.belongsTo(Services, { foreignKey: "service_id", onDelete: "CASCADE" });
Queues.belongsTo(Businesses, { foreignKey: "business_id", onDelete: "CASCADE" });

// Services
Services.belongsTo(Businesses, { foreignKey: "business_id", onDelete: "CASCADE" });

// Professionals
Professionals.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Professionals.belongsTo(Businesses, { foreignKey: "business_id", onDelete: "CASCADE" });

// OTP
OTP.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Notifications
Notifications.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Exportar todos os modelos
module.exports = {
  db,
  User,
  Services,
  Reviews,
  Queues,
  Businesses,
  Professionals,
  OTP,
  Notifications,
};