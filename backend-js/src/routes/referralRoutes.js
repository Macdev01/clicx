const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * components:
 *   schemas:
 *     Referral:
 *       type: object
 *       required:
 *         - referrerId
 *         - referredId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the referral
 *         referrerId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who made the referral
 *         referredId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who was referred
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           description: Referral status
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the referral was completed
 *         referrer:
 *           $ref: '#/components/schemas/User'
 *         referred:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Get all referrals with pagination and filtering
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of referrals per page
 *       - in: query
 *         name: referrerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by referrer ID
 *       - in: query
 *         name: referredId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by referred user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of referrals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Referral'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, requireAdmin, referralController.getReferrals);

/**
 * @swagger
 * /api/referrals/{id}:
 *   get:
 *     summary: Get a single referral by ID
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Referral ID
 *     responses:
 *       200:
 *         description: Referral details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral not found
 */
router.get('/:id', requireAuth, validateUUID, referralController.getReferralById);

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     summary: Create a new referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referredId
 *               - referralCode
 *             properties:
 *               referredId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user being referred
 *               referralCode:
 *                 type: string
 *                 description: Referral code of the referrer
 *     responses:
 *       201:
 *         description: Referral created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Invalid input data, cannot refer yourself, invalid referral code, or user already referred
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  requireAuth,
  validate(Joi.object({
    referredId: Joi.string().uuid().required(),
    referralCode: Joi.string().required()
  })),
  referralController.createReferral
);

/**
 * @swagger
 * /api/referrals/{id}/status:
 *   put:
 *     summary: Update referral status
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Referral ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 description: New referral status
 *     responses:
 *       200:
 *         description: Referral status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral not found
 */
router.put('/:id/status',
  requireAuth,
  requireAdmin,
  validateUUID,
  validate(Joi.object({
    status: Joi.string().valid('pending', 'completed', 'cancelled').required()
  })),
  referralController.updateReferralStatus
);

/**
 * @swagger
 * /api/referrals/user/me:
 *   get:
 *     summary: Get current user's referrals (as referrer)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of referrals per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: User's referrals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Referral'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me',
  requireAuth,
  referralController.getUserReferrals
);

/**
 * @swagger
 * /api/referrals/user/me/stats:
 *   get:
 *     summary: Get current user's referral statistics
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's referral statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReferrals:
 *                       type: number
 *                     completedReferrals:
 *                       type: number
 *                     pendingReferrals:
 *                       type: number
 *                     totalRewards:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me/stats',
  requireAuth,
  referralController.getUserReferralStats
);

/**
 * @swagger
 * /api/referrals/user/me/code:
 *   get:
 *     summary: Get current user's referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's referral code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralCode:
 *                       type: string
 *                     referralLink:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me/code',
  requireAuth,
  referralController.getMyReferralCode
);

/**
 * @swagger
 * /api/referrals/validate/{code}:
 *   get:
 *     summary: Validate a referral code
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral code to validate
 *     responses:
 *       200:
 *         description: Referral code validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     referrer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         nickname:
 *                           type: string
 *                         avatarUrl:
 *                           type: string
 *       400:
 *         description: Invalid referral code
 */
router.get('/validate/:code',
  referralController.validateReferralCode
);

/**
 * @swagger
 * /api/referrals/stats:
 *   get:
 *     summary: Get referral statistics (admin only)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Referral statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: number
 *                     totalReferrals:
 *                       type: number
 *                     completedReferrals:
 *                       type: number
 *                     totalRewards:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats',
  requireAuth,
  requireAdmin,
  referralController.getReferralStats
);

module.exports = router;
