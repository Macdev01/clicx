const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavedPost = sequelize.define('SavedPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'saved_posts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'postId'],
      unique: true,
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['postId'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

module.exports = SavedPost;
