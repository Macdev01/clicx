const { Order, User, Payment } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Order Controller
 * Handles all order-related operations including order management and payment processing
 */
class OrderController {
  /**
   * Get all orders with pagination and filtering
   */
  async getOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, userId, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (status) whereClause.status = status;

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
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
        data: orders.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.count,
          pages: Math.ceil(orders.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod', 'transactionId']
          }
        ]
      });

      if (!order) {
        throw new ApiError('Order not found', 404);
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req, res, next) {
    try {
      const { amount, currency, paymentMethod, description } = req.body;
      const userId = req.user.id;

      // Create payment record
      const payment = await Payment.create({
        amount,
        currency: currency || 'USD',
        status: 'pending',
        paymentMethod: paymentMethod || 'card',
        userId
      });

      // Create order record
      const order = await Order.create({
        userId,
        paymentId: payment.id,
        amount,
        currency: currency || 'USD',
        status: 'pending',
        description
      });

      // Fetch the created order with associations
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'amount', 'currency', 'status', 'paymentMethod']
          }
        ]
      });

      logger.info(`Order created: ${order.id} by user: ${userId}`);

      res.status(201).json({
        success: true,
        data: createdOrder
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Payment,
            as: 'payment'
          }
        ]
      });

      if (!order) {
        throw new ApiError('Order not found', 404);
      }

      // Update order status
      await order.update({ status });

      // Update payment status if order is completed
      if (status === 'completed' && order.payment) {
        await order.payment.update({ status: 'completed' });
      }

      logger.info(`Order status updated: ${id} to ${status}`);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (status) whereClause.status = status;

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
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
        data: orders.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.count,
          pages: Math.ceil(orders.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const order = await Order.findByPk(id);
      if (!order) {
        throw new ApiError('Order not found', 404);
      }

      // Check ownership or admin rights
      if (order.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to cancel this order', 403);
      }

      if (order.status === 'cancelled') {
        throw new ApiError('Order already cancelled', 400);
      }

      await order.update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      });

      logger.info(`Order cancelled: ${id} by user: ${userId}`);

      res.json({
        success: true,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(req, res, next) {
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

      const stats = await Order.findAll({
        where: whereClause,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount']
        ],
        group: ['status']
      });

      const totalOrders = await Order.count({ where: whereClause });
      const totalRevenue = await Order.sum('amount', { 
        where: { ...whereClause, status: 'completed' }
      }) || 0;

      res.json({
        success: true,
        data: {
          stats,
          totalOrders,
          totalRevenue
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
