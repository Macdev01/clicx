const { Referral, User } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Referral Controller
 * Handles all referral-related operations including referral tracking and rewards
 */
class ReferralController {
  /**
   * Get all referrals with pagination and filtering
   */
  async getReferrals(req, res, next) {
    try {
      const { page = 1, limit = 20, referrerId, referredId, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (referrerId) whereClause.referrerId = referrerId;
      if (referredId) whereClause.referredId = referredId;
      if (status) whereClause.status = status;

      const referrals = await Referral.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'referrer',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: User,
            as: 'referred',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: referrals.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: referrals.count,
          pages: Math.ceil(referrals.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single referral by ID
   */
  async getReferralById(req, res, next) {
    try {
      const { id } = req.params;

      const referral = await Referral.findByPk(id, {
        include: [
          {
            model: User,
            as: 'referrer',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: User,
            as: 'referred',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          }
        ]
      });

      if (!referral) {
        throw new ApiError('Referral not found', 404);
      }

      res.json({
        success: true,
        data: referral
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new referral
   */
  async createReferral(req, res, next) {
    try {
      const { referredId, referralCode } = req.body;
      const referrerId = req.user.id;

      // Check if trying to refer self
      if (referredId === referrerId) {
        throw new ApiError('Cannot refer yourself', 400);
      }

      // Check if referral code is valid
      const referrer = await User.findOne({
        where: { referralCode }
      });

      if (!referrer) {
        throw new ApiError('Invalid referral code', 400);
      }

      // Check if already referred
      const existingReferral = await Referral.findOne({
        where: { referrerId: referrer.id, referredId }
      });

      if (existingReferral) {
        throw new ApiError('User already referred', 400);
      }

      // Create referral record
      const referral = await Referral.create({
        referrerId: referrer.id,
        referredId,
        status: 'pending'
      });

      // Fetch the created referral with associations
      const createdReferral = await Referral.findByPk(referral.id, {
        include: [
          {
            model: User,
            as: 'referrer',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          },
          {
            model: User,
            as: 'referred',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          }
        ]
      });

      logger.info(`Referral created: ${referral.id} by user: ${referrerId}`);

      res.status(201).json({
        success: true,
        data: createdReferral
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update referral status
   */
  async updateReferralStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const referral = await Referral.findByPk(id, {
        include: [
          {
            model: User,
            as: 'referrer'
          },
          {
            model: User,
            as: 'referred'
          }
        ]
      });

      if (!referral) {
        throw new ApiError('Referral not found', 404);
      }

      // Update referral status
      await referral.update({ status });

      // Process rewards if referral is completed
      if (status === 'completed') {
        const rewardAmount = parseFloat(process.env.REFERRAL_REWARD_AMOUNT) || 10;
        
        // Add reward to referrer
        await referral.referrer.update({
          balance: referral.referrer.balance + rewardAmount
        });

        // Add bonus to referred user
        const bonusAmount = parseFloat(process.env.REFERRAL_BONUS_AMOUNT) || 5;
        await referral.referred.update({
          balance: referral.referred.balance + bonusAmount
        });

        logger.info(`Referral completed: ${id}, rewards distributed`);
      }

      logger.info(`Referral status updated: ${id} to ${status}`);

      res.json({
        success: true,
        data: referral
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's referrals (as referrer)
   */
  async getUserReferrals(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { referrerId: userId };
      if (status) whereClause.status = status;

      const referrals = await Referral.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'referred',
            attributes: ['id', 'nickname', 'avatarUrl', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: referrals.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: referrals.count,
          pages: Math.ceil(referrals.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's referral statistics
   */
  async getUserReferralStats(req, res, next) {
    try {
      const userId = req.user.id;

      const totalReferrals = await Referral.count({
        where: { referrerId: userId }
      });

      const completedReferrals = await Referral.count({
        where: { referrerId: userId, status: 'completed' }
      });

      const pendingReferrals = await Referral.count({
        where: { referrerId: userId, status: 'pending' }
      });

      const totalRewards = completedReferrals * (parseFloat(process.env.REFERRAL_REWARD_AMOUNT) || 10);

      res.json({
        success: true,
        data: {
          totalReferrals,
          completedReferrals,
          pendingReferrals,
          totalRewards
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get referral code for current user
   */
  async getMyReferralCode(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          referralCode: user.referralCode,
          referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(req, res, next) {
    try {
      const { code } = req.params;

      const user = await User.findOne({
        where: { referralCode: code }
      });

      if (!user) {
        throw new ApiError('Invalid referral code', 400);
      }

      res.json({
        success: true,
        data: {
          isValid: true,
          referrer: {
            id: user.id,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get referral statistics (admin only)
   */
  async getReferralStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

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

      const stats = await Referral.findAll({
        where: whereClause,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      const totalReferrals = await Referral.count({ where: whereClause });
      const completedReferrals = await Referral.count({ 
        where: { ...whereClause, status: 'completed' }
      });

      const totalRewards = completedReferrals * (parseFloat(process.env.REFERRAL_REWARD_AMOUNT) || 10);

      res.json({
        success: true,
        data: {
          stats,
          totalReferrals,
          completedReferrals,
          totalRewards
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReferralController();
