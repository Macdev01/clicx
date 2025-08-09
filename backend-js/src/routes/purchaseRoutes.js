const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * components:
 *   schemas:
 *     Purchase:
 *       type: object
 *       required:
 *         - userId
 *         - postId
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the purchase
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who made the purchase
 *         postId:
 *           type: string
 *           format: uuid
 *           description: ID of the purchased post
 *         paymentId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated payment
 *         amount:
 *           type: number
 *           description: Purchase amount
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled, failed]
 *           description: Purchase status
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: When the purchase was cancelled
 *         cancellationReason:
 *           type: string
 *           description: Reason for cancellation
 *         user:
 *           $ref: '#/components/schemas/User'
 *         post:
 *           $ref: '#/components/schemas/Post'
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Get all purchases with pagination and filtering
 *     tags: [Purchases]
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
 *         description: Number of purchases per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by post ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of purchases
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
 *                     $ref: '#/components/schemas/Purchase'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, requireAdmin, purchaseController.getPurchases);

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Get a single purchase by ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Purchase not found
 */
router.get('/:id', requireAuth, validateUUID, purchaseController.getPurchaseById);

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Create a new purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the post to purchase
 *               paymentMethod:
 *                 type: string
 *                 enum: [balance, card, crypto]
 *                 default: balance
 *                 description: Payment method
 *     responses:
 *       201:
 *         description: Purchase created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Invalid input data, post not premium, already purchased, or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/',
  requireAuth,
  validate(Joi.object({
    postId: Joi.string().uuid().required(),
    paymentMethod: Joi.string().valid('balance', 'card', 'crypto').default('balance')
  })),
  purchaseController.createPurchase
);

/**
 * @swagger
 * /api/purchases/user/me:
 *   get:
 *     summary: Get current user's purchase history
 *     tags: [Purchases]
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
 *         description: Number of purchases per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: User's purchase history
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
 *                     $ref: '#/components/schemas/Purchase'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me',
  requireAuth,
  purchaseController.getUserPurchases
);

/**
 * @swagger
 * /api/purchases/user/me/earnings:
 *   get:
 *     summary: Get current user's earnings (for content creators)
 *     tags: [Purchases]
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
 *         description: Number of earnings per page
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
 *         description: User's earnings
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
 *                     $ref: '#/components/schemas/Purchase'
 *                 totalEarnings:
 *                   type: number
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me/earnings',
  requireAuth,
  purchaseController.getUserEarnings
);

/**
 * @swagger
 * /api/purchases/{id}/cancel:
 *   put:
 *     summary: Cancel a purchase (admin only)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Purchase cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Purchase already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Purchase not found
 */
router.put('/:id/cancel',
  requireAuth,
  requireAdmin,
  validateUUID,
  validate(Joi.object({
    reason: Joi.string().required().max(500)
  })),
  purchaseController.cancelPurchase
);

/**
 * @swagger
 * /api/purchases/stats:
 *   get:
 *     summary: Get purchase statistics
 *     tags: [Purchases]
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Purchase statistics
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
 *                           totalAmount:
 *                             type: number
 *                     totalPurchases:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats',
  requireAuth,
  requireAdmin,
  purchaseController.getPurchaseStats
);

module.exports = router;
