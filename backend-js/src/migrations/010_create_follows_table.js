'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('follows', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      follower_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      following_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'blocked'),
        defaultValue: 'accepted',
      },
      followed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for follower_id and following_id combination
    await queryInterface.addConstraint('follows', {
      fields: ['follower_id', 'following_id'],
      type: 'unique',
      name: 'follows_follower_following_unique',
    });

    // Add indexes
    await queryInterface.addIndex('follows', ['follower_id']);
    await queryInterface.addIndex('follows', ['following_id']);
    await queryInterface.addIndex('follows', ['status']);
    await queryInterface.addIndex('follows', ['followed_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('follows');
  },
};
