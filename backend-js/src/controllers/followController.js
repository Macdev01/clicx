const { Follow, User, ModelProfile } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Follow Controller
 * Handles all follow-related operations including following, unfollowing, and follower management
 */
class FollowController {
  /**
   * Follow a user
   */
  async followUser(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      // Check if trying to follow self
      if (userId === followerId) {
        throw new ApiError('Cannot follow yourself', 400);
      }

      // Check if user exists
      const userToFollow = await User.findByPk(userId);
      if (!userToFollow) {
        throw new ApiError('User not found', 404);
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        where: { followerId, followingId: userId }
      });

      if (existingFollow) {
        throw new ApiError('Already following this user', 400);
      }

      // Create follow relationship
      const follow = await Follow.create({
        followerId,
        followingId: userId
      });

      logger.info(`User ${followerId} started following user ${userId}`);

      res.status(201).json({
        success: true,
        data: {
          id: follow.id,
          followerId,
          followingId: userId,
          createdAt: follow.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      const follow = await Follow.findOne({
        where: { followerId, followingId: userId }
      });

      if (!follow) {
        throw new ApiError('Not following this user', 400);
      }

      await follow.destroy();

      logger.info(`User ${followerId} unfollowed user ${userId}`);

      res.json({
        success: true,
        message: 'Unfollowed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const followers = await Follow.findAndCountAll({
        where: { followingId: userId },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'nickname', 'avatarUrl', 'isVerified']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: followers.rows.map(f => f.follower),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: followers.count,
          pages: Math.ceil(followers.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users that a user is following
   */
  async getUserFollowing(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const following = await Follow.findAndCountAll({
        where: { followerId: userId },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'nickname', 'avatarUrl', 'isVerified']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: following.rows.map(f => f.following),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: following.count,
          pages: Math.ceil(following.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if current user is following another user
   */
  async checkFollowStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      const follow = await Follow.findOne({
        where: { followerId, followingId: userId }
      });

      res.json({
        success: true,
        data: {
          isFollowing: !!follow,
          followId: follow?.id
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's followers
   */
  async getMyFollowers(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const followers = await Follow.findAndCountAll({
        where: { followingId: userId },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'nickname', 'avatarUrl', 'isVerified']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: followers.rows.map(f => f.follower),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: followers.count,
          pages: Math.ceil(followers.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's following list
   */
  async getMyFollowing(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const following = await Follow.findAndCountAll({
        where: { followerId: userId },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'nickname', 'avatarUrl', 'isVerified']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: following.rows.map(f => f.following),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: following.count,
          pages: Math.ceil(following.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get follow statistics for a user
   */
  async getUserFollowStats(req, res, next) {
    try {
      const { userId } = req.params;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const followerCount = await Follow.count({
        where: { followingId: userId }
      });

      const followingCount = await Follow.count({
        where: { followerId: userId }
      });

      res.json({
        success: true,
        data: {
          followerCount,
          followingCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's follow statistics
   */
  async getMyFollowStats(req, res, next) {
    try {
      const userId = req.user.id;

      const followerCount = await Follow.count({
        where: { followingId: userId }
      });

      const followingCount = await Follow.count({
        where: { followerId: userId }
      });

      res.json({
        success: true,
        data: {
          followerCount,
          followingCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      // Get users that the current user is not following
      const followingIds = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      const followingIdList = followingIds.map(f => f.followingId);
      followingIdList.push(userId); // Exclude self

      const suggestedUsers = await User.findAll({
        where: {
          id: {
            [require('sequelize').Op.notIn]: followingIdList
          }
        },
        attributes: ['id', 'nickname', 'avatarUrl', 'isVerified'],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: suggestedUsers
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FollowController();
