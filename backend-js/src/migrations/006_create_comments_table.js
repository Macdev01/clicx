'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
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
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000],
        },
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      is_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('comments', ['post_id']);
    await queryInterface.addIndex('comments', ['user_id']);
    await queryInterface.addIndex('comments', ['parent_id']);
    await queryInterface.addIndex('comments', ['created_at']);
    await queryInterface.addIndex('comments', ['is_deleted']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  },
};
