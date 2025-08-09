const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
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
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  commentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'postId'],
      unique: true,
      where: {
        postId: {
          [require('sequelize').Op.ne]: null,
        },
      },
    },
    {
      fields: ['userId', 'commentId'],
      unique: true,
      where: {
        commentId: {
          [require('sequelize').Op.ne]: null,
        },
      },
    },
    {
      fields: ['postId'],
    },
    {
      fields: ['commentId'],
    },
  ],
  validate: {
    eitherPostOrComment() {
      if ((!this.postId && !this.commentId) || (this.postId && this.commentId)) {
        throw new Error('Like must be associated with either a post or a comment, but not both');
      }
    },
  },
});

module.exports = Like;
