'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
        allowNull: false,
        validate: {
          len: [3, 3],
        },
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
        defaultValue: 'pending',
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refunded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      refund_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['transaction_id']);
    await queryInterface.addIndex('payments', ['method']);
    await queryInterface.addIndex('payments', ['paid_at']);
    await queryInterface.addIndex('payments', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  },
};
