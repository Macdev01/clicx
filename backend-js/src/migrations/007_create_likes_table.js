'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
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
      type: {
        type: Sequelize.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
        defaultValue: 'like',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for post_id and user_id combination
    await queryInterface.addConstraint('likes', {
      fields: ['post_id', 'user_id'],
      type: 'unique',
      name: 'likes_post_user_unique',
    });

    // Add indexes
    await queryInterface.addIndex('likes', ['post_id']);
    await queryInterface.addIndex('likes', ['user_id']);
    await queryInterface.addIndex('likes', ['type']);
    await queryInterface.addIndex('likes', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  },
};
