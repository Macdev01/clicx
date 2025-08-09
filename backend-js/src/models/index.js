const User = require('./User');
const Post = require('./Post');
const ModelProfile = require('./ModelProfile');
const Media = require('./Media');
const Comment = require('./Comment');
const Like = require('./Like');
const SavedPost = require('./SavedPost');
const Purchase = require('./Purchase');
const Follow = require('./Follow');
const Referral = require('./Referral');
const Order = require('./Order');
const Payment = require('./Payment');
const Video = require('./Video');
const Log = require('./Log');

// User relationships
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
User.hasOne(ModelProfile, { foreignKey: 'userId', as: 'modelProfile' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
User.hasMany(SavedPost, { foreignKey: 'userId', as: 'savedPosts' });
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Follow, { foreignKey: 'followerId', as: 'following' });
User.hasMany(Follow, { foreignKey: 'followingId', as: 'followers' });
User.hasMany(Referral, { foreignKey: 'userId', as: 'referrals' });
User.belongsTo(User, { foreignKey: 'referredBy', as: 'referredByUser' });

// Post relationships
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.belongsTo(ModelProfile, { foreignKey: 'modelId', as: 'modelProfile' });
Post.hasMany(Media, { foreignKey: 'postId', as: 'media' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Post.hasMany(SavedPost, { foreignKey: 'postId', as: 'savedPosts' });
Post.hasMany(Purchase, { foreignKey: 'postId', as: 'purchases' });

// ModelProfile relationships
ModelProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ModelProfile.hasMany(Post, { foreignKey: 'modelId', as: 'posts' });

// Media relationships
Media.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment relationships
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Like relationships
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// SavedPost relationships
SavedPost.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SavedPost.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Purchase relationships
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Purchase.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Follow relationships
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });

// Referral relationships
Referral.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order relationships
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });

// Payment relationships
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  User,
  Post,
  ModelProfile,
  Media,
  Comment,
  Like,
  SavedPost,
  Purchase,
  Follow,
  Referral,
  Order,
  Payment,
  Video,
  Log,
};
