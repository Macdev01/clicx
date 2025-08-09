const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  modelId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'model_profiles',
      key: 'id',
    },
  },
  isPurchased: {
    type: DataTypes.VIRTUAL,
    get() {
      return false; // This will be set by the controller
    },
  },
}, {
  tableName: 'posts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['model_id'],
    },
    {
      fields: ['published_at'],
    },
    {
      fields: ['is_premium'],
    },
  ],
});

module.exports = Post;
