'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'cancelled', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      billing_address: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      shipping_address: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      notes: {
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
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['order_number']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['transaction_id']);
    await queryInterface.addIndex('orders', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};
