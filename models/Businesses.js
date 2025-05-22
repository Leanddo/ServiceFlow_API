const Sequelize = require("sequelize");
const db = require("../config/database");

const Businesses = db.define("Businesses", {
  business_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  business_email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  main_photo_url: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: Sequelize.STRING,
  },
  business_type: {
    type: Sequelize.ENUM(
      "Barbershop",
      "Workshop",
      "Clinic",
      "Other",
      "Restaurant",
      "Gym",
      "Hairdresser",
      "Pet Store",
      "Consulting Room",
      "Pharmacy",
      "Photography Studio",
      "Cafeteria",
      "Spa",
      "School",
      "Cleaning Services",
      "Transportation",
      "Hotel",
      "Beauty Salon",
      "Laundry",
      "Kiosk",
      "Event Venue",
      "Bar",
      "Fast Food Restaurant",
      "Car Repair Shop",
      "Consultancy",
      "Design Services",
      "Tattoo Studio",
      "Massage Therapy",
      "Nail Salon",
      "Travel Agency",
    ),
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  opening_hour: {
    type: Sequelize.TIME, // Hora de abertura no formato HH:mm:ss
    allowNull: false,
    defaultValue: "09:00:00", // Valor padrão: 9h
  },
  closing_hour: {
    type: Sequelize.TIME, // Hora de fechamento no formato HH:mm:ss
    allowNull: false,
    defaultValue: "18:00:00", // Valor padrão: 18h
  },
});

module.exports = { Businesses };
