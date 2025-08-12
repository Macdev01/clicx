'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      level: {
        type: Sequelize.ENUM('error', 'warn', 'info', 'debug', 'verbose'),
        allowNull: false,
        defaultValue: 'info',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      meta: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      request_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      endpoint: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 100,
          max: 599,
        },
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('logs', ['level']);
    await queryInterface.addIndex('logs', ['timestamp']);
    await queryInterface.addIndex('logs', ['request_id']);
    await queryInterface.addIndex('logs', ['user_id']);
    await queryInterface.addIndex('logs', ['endpoint']);
    await queryInterface.addIndex('logs', ['status_code']);
    await queryInterface.addIndex('logs', ['ip_address']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logs');
  },
};
