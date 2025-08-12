'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
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
      model_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'model_profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
          notEmpty: true,
        },
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_premium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
        validate: {
          len: [3, 3],
        },
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived', 'deleted'),
        defaultValue: 'draft',
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      comments_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      tags: {
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
    await queryInterface.addIndex('posts', ['user_id']);
    await queryInterface.addIndex('posts', ['model_id']);
    await queryInterface.addIndex('posts', ['status']);
    await queryInterface.addIndex('posts', ['is_premium']);
    await queryInterface.addIndex('posts', ['published_at']);
    await queryInterface.addIndex('posts', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  },
};
