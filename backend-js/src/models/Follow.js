const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  followerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  followingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'follows',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['followerId', 'followingId'],
      unique: true,
    },
    {
      fields: ['followerId'],
    },
    {
      fields: ['followingId'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['createdAt'],
    },
  ],
  validate: {
    notSelfFollow() {
      if (this.followerId === this.followingId) {
        throw new Error('Users cannot follow themselves');
      }
    },
  },
});

module.exports = Follow;
