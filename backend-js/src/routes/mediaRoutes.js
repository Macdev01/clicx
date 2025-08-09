const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       required:
 *         - type
 *         - url
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the media
 *         type:
 *           type: string
 *           enum: [image, video]
 *           description: Type of media
 *         url:
 *           type: string
 *           description: CDN URL of the media file
 *         thumbnailUrl:
 *           type: string
 *           description: CDN URL of the thumbnail (for images)
 *         originalName:
 *           type: string
 *           description: Original filename
 *         size:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         description:
 *           type: string
 *           description: Optional description
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who uploaded the media
 *         modelId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated model (if any)
 *         postId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated post (if any)
 *         user:
 *           $ref: '#/components/schemas/User'
 *         model:
 *           $ref: '#/components/schemas/ModelProfile'
 *         post:
 *           $ref: '#/components/schemas/Post'
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload media files
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - media
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Media files to upload
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *                 description: Type of media
 *               modelId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated model ID
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated post ID
 *     responses:
 *       201:
 *         description: Media uploaded successfully
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
 *       400:
 *         description: Invalid file type or no files uploaded
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post('/upload',
  requireAuth,
  mediaController.uploadMedia.bind(mediaController)
);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media ID
 *     responses:
 *       200:
 *         description: Media details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       404:
 *         description: Media not found
 */
router.get('/:id', validateUUID, mediaController.getMediaById);

/**
 * @swagger
 * /api/media/{id}:
 *   put:
 *     summary: Update media metadata
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *                 description: Type of media
 *               description:
 *                 type: string
 *                 description: Media description
 *     responses:
 *       200:
 *         description: Media updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the media owner
 *       404:
 *         description: Media not found
 */
router.put('/:id',
  requireAuth,
  validateUUID,
  validate(Joi.object({
    type: Joi.string().valid('image', 'video').optional(),
    description: Joi.string().max(500).optional()
  })),
  mediaController.updateMedia
);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Delete media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media ID
 *     responses:
 *       200:
 *         description: Media deleted successfully
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
 *         description: Forbidden - not the media owner
 *       404:
 *         description: Media not found
 */
router.delete('/:id',
  requireAuth,
  validateUUID,
  mediaController.deleteMedia
);

/**
 * @swagger
 * /api/media/user/me:
 *   get:
 *     summary: Get current user's media
 *     tags: [Media]
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
 *         description: Number of media items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: Filter by media type
 *     responses:
 *       200:
 *         description: User's media
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
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me',
  requireAuth,
  mediaController.getUserMedia
);

/**
 * @swagger
 * /api/media/user/me/stats:
 *   get:
 *     summary: Get current user's media statistics
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media statistics
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
 *                           type:
 *                             type: string
 *                           count:
 *                             type: number
 *                           totalSize:
 *                             type: number
 *                     totalFiles:
 *                       type: number
 *                     totalSize:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/user/me/stats',
  requireAuth,
  mediaController.getMediaStats
);

/**
 * @swagger
 * /api/media/type/{type}:
 *   get:
 *     summary: Get media by type
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: Media type
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
 *         description: Number of media items per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by model ID
 *     responses:
 *       200:
 *         description: Media by type
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
 */
router.get('/type/:type',
  validate(Joi.object({
    type: Joi.string().valid('image', 'video').required()
  })),
  mediaController.getMediaByType
);

module.exports = router;
