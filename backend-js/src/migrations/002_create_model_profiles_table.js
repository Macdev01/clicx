'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('model_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          len: [2, 64],
          notEmpty: true,
        },
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      followers_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      posts_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 5,
        },
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
    await queryInterface.addIndex('model_profiles', ['user_id']);
    await queryInterface.addIndex('model_profiles', ['name']);
    await queryInterface.addIndex('model_profiles', ['rating']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('model_profiles');
  },
};
