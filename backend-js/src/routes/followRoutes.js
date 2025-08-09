const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Follow:
 *       type: object
 *       required:
 *         - followerId
 *         - followingId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the follow relationship
 *         followerId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who is following
 *         followingId:
 *           type: string
 *           format: uuid
 *           description: ID of the user being followed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the follow relationship was created
 *         follower:
 *           $ref: '#/components/schemas/User'
 *         following:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to follow
 *     responses:
 *       201:
 *         description: Successfully followed user
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     followerId:
 *                       type: string
 *                       format: uuid
 *                     followingId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot follow yourself or already following
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/:userId',
  requireAuth,
  validateUUID,
  followController.followUser
);

/**
 * @swagger
 * /api/follow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
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
 *         description: Not following this user
 *       401:
 *         description: Unauthorized
 */
router.delete('/:userId',
  requireAuth,
  validateUUID,
  followController.unfollowUser
);

/**
 * @swagger
 * /api/follow/{userId}/status:
 *   get:
 *     summary: Check if current user is following another user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to check
 *     responses:
 *       200:
 *         description: Follow status
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
 *                     isFollowing:
 *                       type: boolean
 *                     followId:
 *                       type: string
 *                       format: uuid
 *       401:
 *         description: Unauthorized
 */
router.get('/:userId/status',
  requireAuth,
  validateUUID,
  followController.checkFollowStatus
);

/**
 * @swagger
 * /api/follow/{userId}/followers:
 *   get:
 *     summary: Get user's followers
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *         description: User's followers
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
 *         description: User not found
 */
router.get('/:userId/followers',
  validateUUID,
  followController.getUserFollowers
);

/**
 * @swagger
 * /api/follow/{userId}/following:
 *   get:
 *     summary: Get users that a user is following
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *         description: Number of following per page
 *     responses:
 *       200:
 *         description: Users that the user is following
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
 *         description: User not found
 */
router.get('/:userId/following',
  validateUUID,
  followController.getUserFollowing
);

/**
 * @swagger
 * /api/follow/{userId}/stats:
 *   get:
 *     summary: Get user's follow statistics
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Follow statistics
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
 *                     followingCount:
 *                       type: number
 *       404:
 *         description: User not found
 */
router.get('/:userId/stats',
  validateUUID,
  followController.getUserFollowStats
);

/**
 * @swagger
 * /api/follow/me/followers:
 *   get:
 *     summary: Get current user's followers
 *     tags: [Follow]
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
 *         description: Number of followers per page
 *     responses:
 *       200:
 *         description: Current user's followers
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
 *       401:
 *         description: Unauthorized
 */
router.get('/me/followers',
  requireAuth,
  followController.getMyFollowers
);

/**
 * @swagger
 * /api/follow/me/following:
 *   get:
 *     summary: Get current user's following list
 *     tags: [Follow]
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
 *         description: Number of following per page
 *     responses:
 *       200:
 *         description: Current user's following list
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
 *       401:
 *         description: Unauthorized
 */
router.get('/me/following',
  requireAuth,
  followController.getMyFollowing
);

/**
 * @swagger
 * /api/follow/me/stats:
 *   get:
 *     summary: Get current user's follow statistics
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's follow statistics
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
 *                     followingCount:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/me/stats',
  requireAuth,
  followController.getMyFollowStats
);

/**
 * @swagger
 * /api/follow/suggested:
 *   get:
 *     summary: Get suggested users to follow
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of suggested users to return
 *     responses:
 *       200:
 *         description: Suggested users to follow
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
 *       401:
 *         description: Unauthorized
 */
router.get('/suggested',
  requireAuth,
  followController.getSuggestedUsers
);

module.exports = router;
