'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
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
      type: {
        type: Sequelize.ENUM('image', 'video', 'audio', 'document'),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      thumbnail_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_filename: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      is_premium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      order_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
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
    await queryInterface.addIndex('media', ['post_id']);
    await queryInterface.addIndex('media', ['type']);
    await queryInterface.addIndex('media', ['is_premium']);
    await queryInterface.addIndex('media', ['order_index']);
    await queryInterface.addIndex('media', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media');
  },
};
