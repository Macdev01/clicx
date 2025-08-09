const { User, Post, ModelProfile, SavedPost, Purchase } = require('../models');
const logger = require('../utils/logger');
const { generateReferralCode } = require('../utils/crypto');

class UserController {
  /**
   * Get all users with pagination
   */
  static async getUsers(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const users = await User.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
      });

      res.json({
        status: 'success',
        data: {
          users: users.rows,
          total: users.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get users',
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: ModelProfile,
            as: 'modelProfile',
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Create a new user
   */
  static async createUser(req, res) {
    try {
      const { email, nickname, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
        });
      }

      // Check if nickname is taken
      const existingNickname = await User.findOne({
        where: { nickname },
      });

      if (existingNickname) {
        return res.status(409).json({
          status: 'error',
          code: 'NICKNAME_TAKEN',
          message: 'Nickname is already taken',
        });
      }

      const user = await User.create({
        email,
        nickname,
        password,
        referralCode: generateReferralCode(),
      });

      res.status(201).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }
  }

  /**
   * Update user
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if nickname is taken by another user
      if (updateData.nickname && updateData.nickname !== user.nickname) {
        const existingNickname = await User.findOne({
          where: { nickname: updateData.nickname },
        });

        if (existingNickname) {
          return res.status(409).json({
            status: 'error',
            code: 'NICKNAME_TAKEN',
            message: 'Nickname is already taken',
          });
        }
      }

      await user.update(updateData);

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user',
      });
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      await user.destroy();

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user',
      });
    }
  }

  /**
   * Get user's model profile
   */
  static async getUserModelProfile(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: ModelProfile,
            as: 'modelProfile',
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!user.modelProfile) {
        return res.status(404).json({
          status: 'error',
          code: 'MODEL_PROFILE_NOT_FOUND',
          message: 'Model profile not found',
        });
      }

      res.json({
        status: 'success',
        data: user.modelProfile,
      });
    } catch (error) {
      logger.error('Error getting user model profile:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get model profile',
      });
    }
  }

  /**
   * Get user's saved posts
   */
  static async getUserSavedPosts(req, res) {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const savedPosts = await SavedPost.findAndCountAll({
        where: { userId: id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Post,
            as: 'post',
            include: [
              {
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] },
              },
              {
                model: ModelProfile,
                as: 'modelProfile',
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        status: 'success',
        data: {
          savedPosts: savedPosts.rows,
          total: savedPosts.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      logger.error('Error getting user saved posts:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get saved posts',
      });
    }
  }

  /**
   * Get user's purchased posts
   */
  static async getUserPurchasedPosts(req, res) {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const purchases = await Purchase.findAndCountAll({
        where: { userId: id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Post,
            as: 'post',
            include: [
              {
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] },
              },
              {
                model: ModelProfile,
                as: 'modelProfile',
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        status: 'success',
        data: {
          purchases: purchases.rows,
          total: purchases.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      logger.error('Error getting user purchased posts:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get purchased posts',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: ModelProfile,
            as: 'modelProfile',
          },
        ],
      });

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error getting current user:', error);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get current user',
      });
    }
  }
}

module.exports = UserController;
