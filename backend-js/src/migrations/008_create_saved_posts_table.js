'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_posts', {
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
      collection_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Default',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for post_id and user_id combination
    await queryInterface.addConstraint('saved_posts', {
      fields: ['post_id', 'user_id'],
      type: 'unique',
      name: 'saved_posts_post_user_unique',
    });

    // Add indexes
    await queryInterface.addIndex('saved_posts', ['post_id']);
    await queryInterface.addIndex('saved_posts', ['user_id']);
    await queryInterface.addIndex('saved_posts', ['collection_name']);
    await queryInterface.addIndex('saved_posts', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('saved_posts');
  },
};
