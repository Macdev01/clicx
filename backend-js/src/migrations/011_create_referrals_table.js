'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referrals', {
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
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      invited_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'expired'),
        defaultValue: 'pending',
      },
      reward_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      reward_currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
        validate: {
          len: [3, 3],
        },
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Add indexes
    await queryInterface.addIndex('referrals', ['user_id']);
    await queryInterface.addIndex('referrals', ['referral_code']);
    await queryInterface.addIndex('referrals', ['invited_user_id']);
    await queryInterface.addIndex('referrals', ['status']);
    await queryInterface.addIndex('referrals', ['completed_at']);
    await queryInterface.addIndex('referrals', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referrals');
  },
};
