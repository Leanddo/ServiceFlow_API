const db = require("../config/database");

// Importar modelos
const { User } = require("./Users");
const { Services } = require("./Services");
const { Reviews } = require("./Reviews");
const { Queues } = require("./Queues");
const { Businesses } = require("./Businesses");
const { BusinessesPhotos } = require("./BusinessesPhotos");
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
Queues.belongsTo(Businesses, {
  foreignKey: "business_id",
  onDelete: "CASCADE",
});

// Services
Services.belongsTo(Businesses, {
  foreignKey: "business_id",
  onDelete: "CASCADE",
});

// Professionals
Professionals.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Professionals.belongsTo(Businesses, {
  foreignKey: "business_id",
  onDelete: "CASCADE",
});

// OTP
OTP.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Notifications
Notifications.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

Businesses.hasMany(BusinessesPhotos, {
  foreignKey: "business_id",
  as: "photos",
  onDelete: "CASCADE",
});

BusinessesPhotos.belongsTo(Businesses, {
  foreignKey: "business_id",
  as: "business",
});

// Relacionamento entre Queues e Professionals
Queues.belongsTo(Professionals, {
  foreignKey: "professional_id",
  onDelete: "CASCADE",
});

Professionals.hasMany(Queues, {
  foreignKey: "professional_id",
  onDelete: "CASCADE",
});

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
  BusinessesPhotos,
};
