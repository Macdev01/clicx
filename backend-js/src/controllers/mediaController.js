const { Media, User, ModelProfile, Post } = require('../models');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

/**
 * Media Controller
 * Handles file uploads, media management, and CDN operations
 */
class MediaController {
  /**
   * Configure multer for file uploads
   */
  configureMulter() {
    const storage = multer.memoryStorage();
    
    return multer({
      storage,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: parseInt(process.env.MAX_FILES) || 5
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new ApiError('Invalid file type', 400), false);
        }
      }
    });
  }

  /**
   * Upload media files
   */
  async uploadMedia(req, res, next) {
    try {
      const upload = this.configureMulter();
      
      upload.array('media', parseInt(process.env.MAX_FILES) || 5)(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        if (!req.files || req.files.length === 0) {
          throw new ApiError('No files uploaded', 400);
        }

        const userId = req.user.id;
        const { type, modelId, postId } = req.body;
        const uploadedMedia = [];

        for (const file of req.files) {
          try {
            const mediaId = uuidv4();
            const fileName = `${mediaId}${path.extname(file.originalname)}`;
            
            let processedBuffer = file.buffer;
            let thumbnailBuffer = null;

            // Process images
            if (file.mimetype.startsWith('image/')) {
              // Create thumbnail for images
              thumbnailBuffer = await sharp(file.buffer)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();

              // Optimize main image
              processedBuffer = await sharp(file.buffer)
                .jpeg({ quality: 85 })
                .toBuffer();
            }

            // Upload to CDN (BunnyCDN)
            const cdnUrl = await this.uploadToCDN(fileName, processedBuffer, file.mimetype);
            let thumbnailUrl = null;

            if (thumbnailBuffer) {
              const thumbnailName = `thumb_${fileName}`;
              thumbnailUrl = await this.uploadToCDN(thumbnailName, thumbnailBuffer, 'image/jpeg');
            }

            // Save to database
            const media = await Media.create({
              id: mediaId,
              type: type || 'image',
              url: cdnUrl,
              thumbnailUrl,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype,
              userId,
              modelId,
              postId
            });

            uploadedMedia.push(media);
            
            logger.info(`Media uploaded: ${mediaId} by user: ${userId}`);
          } catch (error) {
            logger.error(`Failed to upload file ${file.originalname}:`, error);
            throw new ApiError(`Failed to upload ${file.originalname}`, 500);
          }
        }

        res.status(201).json({
          success: true,
          data: uploadedMedia
        });
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload file to BunnyCDN
   */
  async uploadToCDN(fileName, buffer, mimeType) {
    try {
      const bunnyUrl = process.env.BUNNY_STORAGE_URL;
      const storageZone = process.env.BUNNY_STORAGE_ZONE;
      const apiKey = process.env.BUNNY_API_KEY;

      if (!bunnyUrl || !storageZone || !apiKey) {
        throw new Error('BunnyCDN configuration missing');
      }

      const uploadUrl = `${bunnyUrl}/${storageZone}/${fileName}`;
      
      const response = await axios.put(uploadUrl, buffer, {
        headers: {
          'AccessKey': apiKey,
          'Content-Type': mimeType,
          'Content-Length': buffer.length
        }
      });

      if (response.status !== 201) {
        throw new Error(`CDN upload failed: ${response.status}`);
      }

      return `${process.env.BUNNY_PULL_ZONE_URL}/${fileName}`;
    } catch (error) {
      logger.error('CDN upload failed:', error);
      throw new ApiError('Failed to upload to CDN', 500);
    }
  }

  /**
   * Get media by ID
   */
  async getMediaById(req, res, next) {
    try {
      const { id } = req.params;

      const media = await Media.findByPk(id, {
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
            model: Post,
            as: 'post',
            attributes: ['id', 'text', 'isPremium']
          }
        ]
      });

      if (!media) {
        throw new ApiError('Media not found', 404);
      }

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's media
   */
  async getUserMedia(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, type } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (type) whereClause.type = type;

      const media = await Media.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: media.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: media.count,
          pages: Math.ceil(media.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete media
   */
  async deleteMedia(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const media = await Media.findByPk(id);
      if (!media) {
        throw new ApiError('Media not found', 404);
      }

      // Check ownership or admin rights
      if (media.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to delete this media', 403);
      }

      // Delete from CDN
      await this.deleteFromCDN(media.url);
      if (media.thumbnailUrl) {
        await this.deleteFromCDN(media.thumbnailUrl);
      }

      await media.destroy();

      logger.info(`Media deleted: ${id} by user: ${userId}`);

      res.json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file from BunnyCDN
   */
  async deleteFromCDN(url) {
    try {
      const bunnyUrl = process.env.BUNNY_STORAGE_URL;
      const storageZone = process.env.BUNNY_STORAGE_ZONE;
      const apiKey = process.env.BUNNY_API_KEY;

      if (!bunnyUrl || !storageZone || !apiKey) {
        logger.warn('BunnyCDN configuration missing, skipping CDN deletion');
        return;
      }

      const fileName = url.split('/').pop();
      const deleteUrl = `${bunnyUrl}/${storageZone}/${fileName}`;

      await axios.delete(deleteUrl, {
        headers: {
          'AccessKey': apiKey
        }
      });
    } catch (error) {
      logger.error('CDN deletion failed:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get media statistics
   */
  async getMediaStats(req, res, next) {
    try {
      const userId = req.user.id;

      const stats = await Media.findAll({
        where: { userId },
        attributes: [
          'type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('size')), 'totalSize']
        ],
        group: ['type']
      });

      const totalFiles = await Media.count({ where: { userId } });
      const totalSize = await Media.sum('size', { where: { userId } }) || 0;

      res.json({
        success: true,
        data: {
          stats,
          totalFiles,
          totalSize
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(req, res, next) {
    try {
      const { id } = req.params;
      const { type, description } = req.body;
      const userId = req.user.id;

      const media = await Media.findByPk(id);
      if (!media) {
        throw new ApiError('Media not found', 404);
      }

      // Check ownership or admin rights
      if (media.userId !== userId && !req.user.isAdmin) {
        throw new ApiError('Unauthorized to update this media', 403);
      }

      await media.update({
        type: type || media.type,
        description: description || media.description
      });

      logger.info(`Media updated: ${id} by user: ${userId}`);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get media by type
   */
  async getMediaByType(req, res, next) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 20, userId, modelId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { type };
      if (userId) whereClause.userId = userId;
      if (modelId) whereClause.modelId = modelId;

      const media = await Media.findAndCountAll({
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
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: media.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: media.count,
          pages: Math.ceil(media.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MediaController();
