const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  level: {
    type: DataTypes.ENUM('error', 'warn', 'info', 'http', 'debug'),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  requestId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  ip: {
    type: DataTypes.INET,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  errorStack: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'logs',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['level'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['requestId'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['statusCode'],
    },
    {
      fields: ['ip'],
    },
  ],
});

module.exports = Log;
