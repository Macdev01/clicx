const { Post, User, ModelProfile, Media, Comment, Like, SavedPost, Purchase, sequelize } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');
const { validatePagination } = require('../middleware/validation');

/**
 * Post Controller
 * Handles all post-related operations including CRUD, premium content, and purchases
 */
class PostController {
  /**
   * Get all posts with pagination and filtering
   */
  async getPosts(req, res, next) {
    try {
      const { page = 1, limit = 20, modelId, isPremium, userId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (modelId) whereClause.modelId = modelId;
      if (isPremium !== undefined) whereClause.isPremium = isPremium === 'true';
      if (userId) whereClause.userId = userId;

      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: ModelProfile,
            as: 'model',
            attributes: ['id', 'name', 'avatarUrl']
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
   * Get a single post by ID
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: ModelProfile,
            as: 'model',
            attributes: ['id', 'name', 'avatarUrl']
          },
          {
            model: Media,
            as: 'media',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'nickname', 'avatarUrl']
            }]
          }
        ]
      });

      if (!post) {
        throw new ApiError('Post not found', 404);
      }

      // Check if user has purchased this post
      let isPurchased = false;
      if (userId && post.isPremium) {
        const purchase = await Purchase.findOne({
          where: { userId, postId: id }
        });
        isPurchased = !!purchase;
      }

      // Add purchase status to response
      const postData = post.toJSON();
      postData.isPurchased = isPurchased;

      res.json({
        success: true,
        data: postData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new post
   */
  async createPost(req, res, next) {
    try {
      const { text, isPremium, price, modelId, mediaIds } = req.body;
      const userId = req.user.id;

      // Validate premium post requirements
      if (isPremium && (!price || price <= 0)) {
        throw new ApiError('Premium posts must have a valid price', 400);
      }

      const post = await Post.create({
        text,
        isPremium: isPremium || false,
        price: isPremium ? price : null,
        userId,
        modelId,
        publishedAt: new Date()
      });

      // Associate media if provided
      if (mediaIds && mediaIds.length > 0) {
        await post.setMedia(mediaIds);
      }

      // Fetch the created post with associations
      const createdPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: ModelProfile,
            as: 'model',
            attributes: ['id', 'name', 'avatarUrl']
          },
          {
            model: Media,
            as: 'media',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ]
      });

      logger.info(`Post created: ${post.id} by user: ${userId}`);

      res.status(201).json({
        success: true,
        data: createdPost
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a post
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { text, isPremium, price, mediaIds } = req.body;
      const userId = req.user.id;

      const post = await Post.findByPk(id);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }

      // Check ownership or admin rights
      if (post.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to update this post', 403);
      }

      // Validate premium post requirements
      if (isPremium && (!price || price <= 0)) {
        throw new ApiError('Premium posts must have a valid price', 400);
      }

      await post.update({
        text,
        isPremium: isPremium || false,
        price: isPremium ? price : null
      });

      // Update media associations if provided
      if (mediaIds) {
        await post.setMedia(mediaIds);
      }

      // Fetch updated post with associations
      const updatedPost = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: ModelProfile,
            as: 'model',
            attributes: ['id', 'name', 'avatarUrl']
          },
          {
            model: Media,
            as: 'media',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ]
      });

      logger.info(`Post updated: ${id} by user: ${userId}`);

      res.json({
        success: true,
        data: updatedPost
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a post
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findByPk(id);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }

      // Check ownership or admin rights
      if (post.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to delete this post', 403);
      }

      await post.destroy();

      logger.info(`Post deleted: ${id} by user: ${userId}`);

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Like/unlike a post
   */
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Use transaction to prevent race conditions
      const t = await sequelize.transaction();
      
      try {
        const post = await Post.findByPk(id, {
          lock: t.LOCK.UPDATE,
          transaction: t
        });
        
        if (!post) {
          await t.rollback();
          throw new ApiError('Post not found', 404);
        }

        const existingLike = await Like.findOne({
          where: { userId, postId: id },
          transaction: t
        });

        let liked;
        let newLikesCount;

        if (existingLike) {
          // Unlike
          await existingLike.destroy({ transaction: t });
          await post.decrement('likesCount', { transaction: t });
          liked = false;
          newLikesCount = post.likesCount - 1;
          
          logger.info(`Post unliked: ${id} by user: ${userId}`);
        } else {
          // Like
          await Like.create({ userId, postId: id }, { transaction: t });
          await post.increment('likesCount', { transaction: t });
          liked = true;
          newLikesCount = post.likesCount + 1;
          
          logger.info(`Post liked: ${id} by user: ${userId}`);
        }
        
        await t.commit();
        
        res.json({
          success: true,
          data: { liked, likesCount: newLikesCount }
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save/unsave a post
   */
  async toggleSaved(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findByPk(id);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }

      const existingSaved = await SavedPost.findOne({
        where: { userId, postId: id }
      });

      if (existingSaved) {
        // Unsave
        await existingSaved.destroy();
        
        logger.info(`Post unsaved: ${id} by user: ${userId}`);
        
        res.json({
          success: true,
          data: { saved: false }
        });
      } else {
        // Save
        await SavedPost.create({ userId, postId: id });
        
        logger.info(`Post saved: ${id} by user: ${userId}`);
        
        res.json({
          success: true,
          data: { saved: true }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's saved posts
   */
  async getSavedPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const savedPosts = await SavedPost.findAndCountAll({
        where: { userId },
        include: [{
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nickname', 'avatarUrl']
            },
            {
              model: ModelProfile,
              as: 'model',
              attributes: ['id', 'name', 'avatarUrl']
            },
            {
              model: Media,
              as: 'media',
              attributes: ['id', 'type', 'url', 'thumbnailUrl']
            }
          ]
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: savedPosts.rows.map(sp => sp.post),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: savedPosts.count,
          pages: Math.ceil(savedPosts.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const posts = await Post.findAll({
        where: {
          publishedAt: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: ModelProfile,
            as: 'model',
            attributes: ['id', 'name', 'avatarUrl']
          },
          {
            model: Media,
            as: 'media',
            attributes: ['id', 'type', 'url', 'thumbnailUrl']
          }
        ],
        order: [['likesCount', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
