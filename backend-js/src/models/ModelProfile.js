const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ModelProfile = sequelize.define('ModelProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [2, 64],
      notEmpty: true,
    },
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 512],
    },
  },
  banner: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  postsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  totalEarnings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'model_profiles',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId'],
      unique: true,
    },
    {
      fields: ['name'],
    },
    {
      fields: ['isVerified'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

module.exports = ModelProfile;
