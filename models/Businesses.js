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
      "Design Services"
    ),
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = { Businesses };
