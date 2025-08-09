const { Purchase, Post, User, Payment } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Purchase Controller
 * Handles all purchase-related operations including payment processing and purchase history
 */
class PurchaseController {
  /**
   * Get all purchases with pagination and filtering
   */
  async getPurchases(req, res, next) {
    try {
      const { page = 1, limit = 20, userId, postId, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (postId) whereClause.postId = postId;
      if (status) whereClause.status = status;

      const purchases = await Purchase.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: Post,
            as: 'post',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'nickname', 'avatarUrl']
            }]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: purchases.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: purchases.count,
          pages: Math.ceil(purchases.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single purchase by ID
   */
  async getPurchaseById(req, res, next) {
    try {
      const { id } = req.params;

      const purchase = await Purchase.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
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
              }
            ]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod', 'transactionId']
          }
        ]
      });

      if (!purchase) {
        throw new ApiError('Purchase not found', 404);
      }

      res.json({
        success: true,
        data: purchase
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new purchase
   */
  async createPurchase(req, res, next) {
    try {
      const { postId, paymentMethod } = req.body;
      const userId = req.user.id;

      // Check if post exists and is premium
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }

      if (!post.isPremium) {
        throw new ApiError('Post is not premium', 400);
      }

      // Check if user already purchased this post
      const existingPurchase = await Purchase.findOne({
        where: { userId, postId }
      });

      if (existingPurchase) {
        throw new ApiError('Post already purchased', 400);
      }

      // Check if user has sufficient balance
      const user = await User.findByPk(userId);
      if (user.balance < post.price) {
        throw new ApiError('Insufficient balance', 400);
      }

      // Create payment record
      const payment = await Payment.create({
        amount: post.price,
        currency: 'USD',
        status: 'pending',
        paymentMethod: paymentMethod || 'balance',
        userId
      });

      // Create purchase record
      const purchase = await Purchase.create({
        userId,
        postId,
        paymentId: payment.id,
        amount: post.price,
        status: 'pending'
      });

      // Process payment
      if (paymentMethod === 'balance') {
        // Deduct from user balance
        await user.update({ balance: user.balance - post.price });
        
        // Update payment and purchase status
        await payment.update({ status: 'completed' });
        await purchase.update({ status: 'completed' });

        // Add earnings to post creator
        const postCreator = await User.findByPk(post.userId);
        if (postCreator) {
          await postCreator.update({ balance: postCreator.balance + post.price });
        }
      }

      // Fetch the created purchase with associations
      const createdPurchase = await Purchase.findByPk(purchase.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          },
          {
            model: Post,
            as: 'post',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'nickname', 'avatarUrl']
            }]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod']
          }
        ]
      });

      logger.info(`Purchase created: ${purchase.id} by user: ${userId} for post: ${postId}`);

      res.status(201).json({
        success: true,
        data: createdPurchase
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (status) whereClause.status = status;

      const purchases = await Purchase.findAndCountAll({
        where: whereClause,
        include: [
          {
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
              }
            ]
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: purchases.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: purchases.count,
          pages: Math.ceil(purchases.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's earnings (for content creators)
   */
  async getUserEarnings(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { 
        '$post.userId$': userId,
        status: 'completed'
      };

      if (startDate) {
        whereClause.createdAt = {
          [require('sequelize').Op.gte]: new Date(startDate)
        };
      }

      if (endDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [require('sequelize').Op.lte]: new Date(endDate)
        };
      }

      const purchases = await Purchase.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'text', 'price']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Calculate total earnings
      const totalEarnings = await Purchase.sum('amount', {
        where: {
          '$post.userId$': userId,
          status: 'completed'
        },
        include: [{
          model: Post,
          as: 'post',
          attributes: []
        }]
      }) || 0;

      res.json({
        success: true,
        data: purchases.rows,
        totalEarnings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: purchases.count,
          pages: Math.ceil(purchases.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a purchase (admin only)
   */
  async cancelPurchase(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user.isAdmin) {
        throw new ApiError('Admin access required', 403);
      }

      const purchase = await Purchase.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user'
          },
          {
            model: Post,
            as: 'post'
          },
          {
            model: Payment,
            as: 'payment'
          }
        ]
      });

      if (!purchase) {
        throw new ApiError('Purchase not found', 404);
      }

      if (purchase.status === 'cancelled') {
        throw new ApiError('Purchase already cancelled', 400);
      }

      // Refund the user if payment was completed
      if (purchase.status === 'completed') {
        await purchase.user.update({
          balance: purchase.user.balance + purchase.amount
        });

        // Deduct from post creator's balance
        const postCreator = await User.findByPk(purchase.post.userId);
        if (postCreator) {
          await postCreator.update({
            balance: postCreator.balance - purchase.amount
          });
        }
      }

      // Update purchase and payment status
      await purchase.update({ 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      });

      if (purchase.payment) {
        await purchase.payment.update({ status: 'refunded' });
      }

      logger.info(`Purchase cancelled: ${id} by admin: ${req.user.id}`);

      res.json({
        success: true,
        message: 'Purchase cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStats(req, res, next) {
    try {
      const { startDate, endDate, userId } = req.query;

      const whereClause = {};
      if (startDate) {
        whereClause.createdAt = {
          [require('sequelize').Op.gte]: new Date(startDate)
        };
      }
      if (endDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [require('sequelize').Op.lte]: new Date(endDate)
        };
      }
      if (userId) whereClause.userId = userId;

      const stats = await Purchase.findAll({
        where: whereClause,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount']
        ],
        group: ['status']
      });

      const totalPurchases = await Purchase.count({ where: whereClause });
      const totalRevenue = await Purchase.sum('amount', { 
        where: { ...whereClause, status: 'completed' }
      }) || 0;

      res.json({
        success: true,
        data: {
          stats,
          totalPurchases,
          totalRevenue
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PurchaseController();
