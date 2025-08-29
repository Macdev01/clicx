const { ModelProfile, User, Post, Media, Follow } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Model Controller
 * Handles all model profile-related operations including CRUD, portfolio, and statistics
 */
class ModelController {
  /**
   * Get all models with pagination and filtering
   */
  async getModels(req, res, next) {
    try {
      const { page = 1, limit = 20, search, category, isVerified } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        // Sanitize search input to prevent SQL injection
        const sanitizedSearch = search.replace(/[%_]/g, '\\$&'); // Escape special SQL characters
        whereClause.name = {
          [Op.iLike]: `%${sanitizedSearch}%`
        };
      }
      if (category) whereClause.category = category;
      if (isVerified !== undefined) whereClause.isVerified = isVerified === 'true';

      const models = await ModelProfile.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Media,
            as: 'portfolio',
            attributes: ['id', 'type', 'url', 'thumbnailUrl'],
            limit: 6 // Show only first 6 portfolio items
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: models.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: models.count,
          pages: Math.ceil(models.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single model by ID
   */
  async getModelById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const model = await ModelProfile.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Media,
            as: 'portfolio',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          },
          {
            model: Post,
            as: 'posts',
            include: [{
              model: Media,
              as: 'media',
              attributes: ['id', 'type', 'url', 'thumbnailUrl']
            }],
            order: [['publishedAt', 'DESC']],
            limit: 10
          }
        ]
      });

      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      // Check if current user is following this model
      let isFollowing = false;
      if (userId) {
        const follow = await Follow.findOne({
          where: { followerId: userId, followingId: model.userId }
        });
        isFollowing = !!follow;
      }

      // Get follower count
      const followerCount = await Follow.count({
        where: { followingId: model.userId }
      });

      // Get post count
      const postCount = await Post.count({
        where: { modelId: id }
      });

      const modelData = model.toJSON();
      modelData.isFollowing = isFollowing;
      modelData.followerCount = followerCount;
      modelData.postCount = postCount;

      res.json({
        success: true,
        data: modelData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new model profile
   */
  async createModel(req, res, next) {
    try {
      const { name, bio, category, socialLinks, portfolioIds } = req.body;
      const userId = req.user.id;

      // Check if user already has a model profile
      const existingModel = await ModelProfile.findOne({
        where: { userId }
      });

      if (existingModel) {
        throw new ApiError('User already has a model profile', 400);
      }

      const model = await ModelProfile.create({
        name,
        bio,
        category,
        socialLinks: socialLinks || {},
        userId,
        isVerified: false
      });

      // Associate portfolio media if provided
      if (portfolioIds && portfolioIds.length > 0) {
        await model.setPortfolio(portfolioIds);
      }

      // Fetch the created model with associations
      const createdModel = await ModelProfile.findByPk(model.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Media,
            as: 'portfolio',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ]
      });

      logger.info(`Model profile created: ${model.id} by user: ${userId}`);

      res.status(201).json({
        success: true,
        data: createdModel
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a model profile
   */
  async updateModel(req, res, next) {
    try {
      const { id } = req.params;
      const { name, bio, category, socialLinks, portfolioIds } = req.body;
      const userId = req.user.id;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      // Check ownership or admin rights
      if (model.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to update this model profile', 403);
      }

      await model.update({
        name,
        bio,
        category,
        socialLinks: socialLinks || model.socialLinks
      });

      // Update portfolio associations if provided
      if (portfolioIds) {
        await model.setPortfolio(portfolioIds);
      }

      // Fetch updated model with associations
      const updatedModel = await ModelProfile.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Media,
            as: 'portfolio',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ]
      });

      logger.info(`Model profile updated: ${id} by user: ${userId}`);

      res.json({
        success: true,
        data: updatedModel
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a model profile
   */
  async deleteModel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      // Check ownership or admin rights
      if (model.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to delete this model profile', 403);
      }

      await model.destroy();

      logger.info(`Model profile deleted: ${id} by user: ${userId}`);

      res.json({
        success: true,
        message: 'Model profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get model's portfolio
   */
  async getModelPortfolio(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      const portfolio = await Media.findAndCountAll({
        where: { modelId: id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: portfolio.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: portfolio.count,
          pages: Math.ceil(portfolio.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get model's posts
   */
  async getModelPosts(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, isPremium } = req.query;
      const offset = (page - 1) * limit;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      const whereClause = { modelId: id };
      if (isPremium !== undefined) {
        whereClause.isPremium = isPremium === 'true';
      }

      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: Media,
            as: 'media',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: posts.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: posts.count,
          pages: Math.ceil(posts.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get model's followers
   */
  async getModelFollowers(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      const followers = await Follow.findAndCountAll({
        where: { followingId: model.userId },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'nickname', 'avatarUrl']
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
   * Get model's statistics
   */
  async getModelStats(req, res, next) {
    try {
      const { id } = req.params;

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      // Get follower count
      const followerCount = await Follow.count({
        where: { followingId: model.userId }
      });

      // Get post counts
      const totalPosts = await Post.count({
        where: { modelId: id }
      });

      const premiumPosts = await Post.count({
        where: { modelId: id, isPremium: true }
      });

      // Get total likes across all posts
      const totalLikes = await Post.sum('likesCount', {
        where: { modelId: id }
      }) || 0;

      // Get total earnings from premium posts
      const totalEarnings = await Post.sum('price', {
        where: { modelId: id, isPremium: true }
      }) || 0;

      res.json({
        success: true,
        data: {
          followerCount,
          totalPosts,
          premiumPosts,
          totalLikes,
          totalEarnings
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify a model (admin only)
   */
  async verifyModel(req, res, next) {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      if (!req.user.isAdmin) {
        throw new ApiError('Admin access required', 403);
      }

      const model = await ModelProfile.findByPk(id);
      if (!model) {
        throw new ApiError('Model not found', 404);
      }

      await model.update({ isVerified });

      logger.info(`Model verification updated: ${id} by admin: ${req.user.id}`);

      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured models
   */
  async getFeaturedModels(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const models = await ModelProfile.findAll({
        where: { isVerified: true },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: Media,
            as: 'portfolio',
            attributes: ['id', 'type', 'url', 'thumbnailUrl'],
            limit: 3
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModelController();
