"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
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
        allowNull: true,
      },
      fotoUrl: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "user",
      },
      google_ID: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("Businesses", {
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

    await queryInterface.createTable("BusinessPhotos", {
      photo_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Businesses",
          key: "business_id",
        },
        onDelete: "CASCADE",
      },
      photo_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("Services", {
      service_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      duration: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      category: {
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
    });

    await queryInterface.createTable("Professionals", {
      professional_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
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
        defaultValue: "Employee",
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

    await queryInterface.createTable("Reviews", {
      review_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      review_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      review_body: {
        type: Sequelize.STRING,
      },
      review_rating: {
        type: Sequelize.DOUBLE,
      },
      availability: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      service_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Services",
          key: "service_id",
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

    await queryInterface.createTable("Notifications", {
      notification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notification_message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notification_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notification_status: {
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
    });

    await queryInterface.createTable("Queues", {
      queue_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      queue_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      queue_estimate_wait_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      service_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Services",
          key: "service_id",
        },
      },
      business_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Businesses",
          key: "business_id",
        },
      },
    });

    await queryInterface.createTable("OTP", {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OTP"); // depende de Users
    await queryInterface.dropTable("Queues"); // depende de Users, Businesses, Services
    await queryInterface.dropTable("Notifications"); // depende de Users
    await queryInterface.dropTable("Reviews"); // depende de Users, Services */
    await queryInterface.dropTable("Professionals"); // depende de Users, Businesses
    await queryInterface.dropTable("Services");
    await queryInterface.dropTable("BusinessPhotos"); // depende de nada// depende de Businesses
    await queryInterface.dropTable("Businesses"); // depende de nada
    await queryInterface.dropTable("Users"); // é base para várias */
  },
};
