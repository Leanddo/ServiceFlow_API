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
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      business_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      business_type: {
        type: Sequelize.STRING,
        allowNull: false,
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
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

  },
  async down(queryInterface, Sequelize) {},
};
