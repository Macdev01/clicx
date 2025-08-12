'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('videos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      media_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'media',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bunny_stream_video_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      playback_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      thumbnail_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      encoding_status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
      },
      encoding_progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      quality: {
        type: Sequelize.ENUM('240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'),
        allowNull: true,
      },
      bitrate: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      fps: {
        type: Sequelize.FLOAT,
        allowNull: true,
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
    await queryInterface.addIndex('videos', ['media_id']);
    await queryInterface.addIndex('videos', ['bunny_stream_video_id']);
    await queryInterface.addIndex('videos', ['encoding_status']);
    await queryInterface.addIndex('videos', ['quality']);
    await queryInterface.addIndex('videos', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('videos');
  },
};
