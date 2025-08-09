const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Referral = sequelize.define('Referral', {
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
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'users',
      key: 'referralCode',
    },
  },
  invitedUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  rewardAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'referrals',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['referralCode'],
    },
    {
      fields: ['invitedUserId'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['createdAt'],
    },
  ],
  validate: {
    notSelfReferral() {
      if (this.userId === this.invitedUserId) {
        throw new Error('Users cannot refer themselves');
      }
    },
  },
});

module.exports = Referral;
