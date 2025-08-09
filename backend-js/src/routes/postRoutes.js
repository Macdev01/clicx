const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the post
 *         text:
 *           type: string
 *           description: Post content text
 *         isPremium:
 *           type: boolean
 *           description: Whether this is a premium post
 *         price:
 *           type: number
 *           description: Price for premium posts
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the post
 *         modelId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated model
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: When the post was published
 *         likesCount:
 *           type: number
 *           description: Number of likes on the post
 *         isPurchased:
 *           type: boolean
 *           description: Whether the current user has purchased this post
 *         user:
 *           $ref: '#/components/schemas/User'
 *         model:
 *           $ref: '#/components/schemas/ModelProfile'
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination and filtering
 *     tags: [Posts]
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
 *         description: Number of posts per page
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by model ID
 *       - in: query
 *         name: isPremium
 *         schema:
 *           type: boolean
 *         description: Filter by premium status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of posts
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
 */
router.get('/', postController.getPosts);

/**
 * @swagger
 * /api/posts/trending:
 *   get:
 *     summary: Get trending posts from the last 7 days
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trending posts to return
 *     responses:
 *       200:
 *         description: List of trending posts
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
 */
router.get('/trending', postController.getTrendingPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get('/:id', validateUUID, postController.getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post content
 *               isPremium:
 *                 type: boolean
 *                 description: Whether this is a premium post
 *               price:
 *                 type: number
 *                 description: Price for premium posts
 *               modelId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated model ID
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of media IDs to associate
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', 
  requireAuth,
  validate(Joi.object({
    text: Joi.string().required().max(1000),
    isPremium: Joi.boolean().default(false),
    price: Joi.when('isPremium', {
      is: true,
      then: Joi.number().positive().required(),
      otherwise: Joi.forbidden()
    }),
    modelId: Joi.string().uuid().optional(),
    mediaIds: Joi.array().items(Joi.string().uuid()).optional()
  })),
  postController.createPost
);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post content
 *               isPremium:
 *                 type: boolean
 *                 description: Whether this is a premium post
 *               price:
 *                 type: number
 *                 description: Price for premium posts
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of media IDs to associate
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found
 */
router.put('/:id',
  requireAuth,
  validateUUID,
  validate(Joi.object({
    text: Joi.string().max(1000).optional(),
    isPremium: Joi.boolean().optional(),
    price: Joi.when('isPremium', {
      is: true,
      then: Joi.number().positive().required(),
      otherwise: Joi.forbidden()
    }),
    mediaIds: Joi.array().items(Joi.string().uuid()).optional()
  })),
  postController.updatePost
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found
 */
router.delete('/:id',
  requireAuth,
  validateUUID,
  postController.deletePost
);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like status updated
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
 *                     liked:
 *                       type: boolean
 *                     likesCount:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/:id/like',
  requireAuth,
  validateUUID,
  postController.toggleLike
);

/**
 * @swagger
 * /api/posts/{id}/save:
 *   post:
 *     summary: Save or unsave a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Save status updated
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
 *                     saved:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/:id/save',
  requireAuth,
  validateUUID,
  postController.toggleSaved
);

/**
 * @swagger
 * /api/posts/saved:
 *   get:
 *     summary: Get user's saved posts
 *     tags: [Posts]
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
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of saved posts
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
 *       401:
 *         description: Unauthorized
 */
router.get('/saved',
  requireAuth,
  postController.getSavedPosts
);

module.exports = router;
