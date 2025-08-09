const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * components:
 *   schemas:
 *     ModelProfile:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the model profile
 *         name:
 *           type: string
 *           description: Model's display name
 *         bio:
 *           type: string
 *           description: Model's biography
 *         category:
 *           type: string
 *           description: Model's category
 *         socialLinks:
 *           type: object
 *           description: Social media links
 *         isVerified:
 *           type: boolean
 *           description: Whether the model is verified
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who owns this model profile
 *         user:
 *           $ref: '#/components/schemas/User'
 *         portfolio:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *         isFollowing:
 *           type: boolean
 *           description: Whether the current user is following this model
 *         followerCount:
 *           type: number
 *           description: Number of followers
 *         postCount:
 *           type: number
 *           description: Number of posts
 */

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get all models with pagination and filtering
 *     tags: [Models]
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
 *         description: Number of models per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by model name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: List of models
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
 *                     $ref: '#/components/schemas/ModelProfile'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', modelController.getModels);

/**
 * @swagger
 * /api/models/featured:
 *   get:
 *     summary: Get featured verified models
 *     tags: [Models]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of featured models to return
 *     responses:
 *       200:
 *         description: List of featured models
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
 *                     $ref: '#/components/schemas/ModelProfile'
 */
router.get('/featured', modelController.getFeaturedModels);

/**
 * @swagger
 * /api/models/{id}:
 *   get:
 *     summary: Get a single model by ID
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModelProfile'
 *       404:
 *         description: Model not found
 */
router.get('/:id', validateUUID, modelController.getModelById);

/**
 * @swagger
 * /api/models:
 *   post:
 *     summary: Create a new model profile
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Model's display name
 *               bio:
 *                 type: string
 *                 description: Model's biography
 *               category:
 *                 type: string
 *                 description: Model's category
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *               portfolioIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of media IDs for portfolio
 *     responses:
 *       201:
 *         description: Model profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModelProfile'
 *       400:
 *         description: Invalid input data or user already has a model profile
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  requireAuth,
  validate(Joi.object({
    name: Joi.string().required().max(100),
    bio: Joi.string().max(1000).optional(),
    category: Joi.string().max(50).optional(),
    socialLinks: Joi.object().optional(),
    portfolioIds: Joi.array().items(Joi.string().uuid()).optional()
  })),
  modelController.createModel
);

/**
 * @swagger
 * /api/models/{id}:
 *   put:
 *     summary: Update a model profile
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Model's display name
 *               bio:
 *                 type: string
 *                 description: Model's biography
 *               category:
 *                 type: string
 *                 description: Model's category
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *               portfolioIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of media IDs for portfolio
 *     responses:
 *       200:
 *         description: Model profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModelProfile'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the model owner
 *       404:
 *         description: Model not found
 */
router.put('/:id',
  requireAuth,
  validateUUID,
  validate(Joi.object({
    name: Joi.string().max(100).optional(),
    bio: Joi.string().max(1000).optional(),
    category: Joi.string().max(50).optional(),
    socialLinks: Joi.object().optional(),
    portfolioIds: Joi.array().items(Joi.string().uuid()).optional()
  })),
  modelController.updateModel
);

/**
 * @swagger
 * /api/models/{id}:
 *   delete:
 *     summary: Delete a model profile
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the model owner
 *       404:
 *         description: Model not found
 */
router.delete('/:id',
  requireAuth,
  validateUUID,
  modelController.deleteModel
);

/**
 * @swagger
 * /api/models/{id}/portfolio:
 *   get:
 *     summary: Get model's portfolio
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
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
 *         description: Number of portfolio items per page
 *     responses:
 *       200:
 *         description: Model's portfolio
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
 *                     $ref: '#/components/schemas/Media'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Model not found
 */
router.get('/:id/portfolio', validateUUID, modelController.getModelPortfolio);

/**
 * @swagger
 * /api/models/{id}/posts:
 *   get:
 *     summary: Get model's posts
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
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
 *         description: Number of posts per page
 *       - in: query
 *         name: isPremium
 *         schema:
 *           type: boolean
 *         description: Filter by premium status
 *     responses:
 *       200:
 *         description: Model's posts
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
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Model not found
 */
router.get('/:id/posts', validateUUID, modelController.getModelPosts);

/**
 * @swagger
 * /api/models/{id}/followers:
 *   get:
 *     summary: Get model's followers
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
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
 *         description: Number of followers per page
 *     responses:
 *       200:
 *         description: Model's followers
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Model not found
 */
router.get('/:id/followers', validateUUID, modelController.getModelFollowers);

/**
 * @swagger
 * /api/models/{id}/stats:
 *   get:
 *     summary: Get model's statistics
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model's statistics
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
 *                     followerCount:
 *                       type: number
 *                     totalPosts:
 *                       type: number
 *                     premiumPosts:
 *                       type: number
 *                     totalLikes:
 *                       type: number
 *                     totalEarnings:
 *                       type: number
 *       404:
 *         description: Model not found
 */
router.get('/:id/stats', validateUUID, modelController.getModelStats);

/**
 * @swagger
 * /api/models/{id}/verify:
 *   put:
 *     summary: Verify a model (admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 description: Verification status
 *     responses:
 *       200:
 *         description: Model verification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModelProfile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Model not found
 */
router.put('/:id/verify',
  requireAuth,
  requireAdmin,
  validateUUID,
  validate(Joi.object({
    isVerified: Joi.boolean().required()
  })),
  modelController.verifyModel
);

module.exports = router;
