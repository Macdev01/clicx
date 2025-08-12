'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/,
        },
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      social_links: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      referred_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['referral_code']);
    await queryInterface.addIndex('users', ['referred_by']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
