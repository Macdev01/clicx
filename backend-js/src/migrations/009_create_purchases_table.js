'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      purchased_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expires_at: {
        type: Sequelize.DATE,
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

    // Add unique constraint for post_id and user_id combination
    await queryInterface.addConstraint('purchases', {
      fields: ['post_id', 'user_id'],
      type: 'unique',
      name: 'purchases_post_user_unique',
    });

    // Add indexes
    await queryInterface.addIndex('purchases', ['post_id']);
    await queryInterface.addIndex('purchases', ['user_id']);
    await queryInterface.addIndex('purchases', ['status']);
    await queryInterface.addIndex('purchases', ['transaction_id']);
    await queryInterface.addIndex('purchases', ['purchased_at']);
    await queryInterface.addIndex('purchases', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchases');
  },
};
