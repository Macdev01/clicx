const Joi = require('joi');
const logger = require('../utils/logger');

// Common validation schemas
const commonSchemas = {
  uuid: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

// User validation schemas
const userSchemas = {
  create: Joi.object({
    email: commonSchemas.email,
    nickname: Joi.string().min(3).max(32).required(),
    password: Joi.string().min(8).max(255).required(),
  }),
  
  update: Joi.object({
    nickname: Joi.string().min(3).max(32).optional(),
    avatarUrl: Joi.string().uri().optional(),
    balance: Joi.number().integer().min(0).optional(),
  }),
};

// Post validation schemas
const postSchemas = {
  create: Joi.object({
    text: Joi.string().max(1000).optional(),
    isPremium: Joi.boolean().default(false),
    userId: commonSchemas.uuid,
    modelId: commonSchemas.uuid,
    price: Joi.number().integer().min(0).default(0),
  }),
  
  update: Joi.object({
    text: Joi.string().max(1000).optional(),
    isPremium: Joi.boolean().optional(),
    price: Joi.number().integer().min(0).optional(),
  }),
};

// Model profile validation schemas
const modelProfileSchemas = {
  create: Joi.object({
    userId: commonSchemas.uuid,
    name: Joi.string().min(2).max(64).required(),
    bio: Joi.string().max(512).optional(),
    banner: Joi.string().uri().optional(),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(64).optional(),
    bio: Joi.string().max(512).optional(),
    banner: Joi.string().uri().optional(),
  }),
};

// Purchase validation schemas
const purchaseSchemas = {
  create: Joi.object({
    postId: commonSchemas.uuid,
  }),
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    summ: Joi.number().integer().min(1).required(),
    description: Joi.string().max(500).optional(),
  }),
  
  update: Joi.object({
    summ: Joi.number().integer().min(1).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'completed', 'cancelled').optional(),
  }),
};

// File upload validation
const fileUploadSchemas = {
  image: Joi.object({
    file: Joi.object({
      mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp', 'image/gif').required(),
      size: Joi.number().max(parseInt(process.env.MAX_FILE_SIZE) || 10485760).required(),
    }).required(),
  }),
  
  video: Joi.object({
    file: Joi.object({
      mimetype: Joi.string().valid('video/mp4', 'video/webm', 'video/avi').required(),
      size: Joi.number().max(parseInt(process.env.MAX_FILE_SIZE) || 10485760).required(),
    }).required(),
  }),
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error:', {
        path: req.path,
        method: req.method,
        errors,
        ip: req.ip,
      });

      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// Custom validation middleware for specific cases
const validatePagination = (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_LIMIT',
      message: 'Limit must be between 1 and 100',
    });
  }
  
  if (isNaN(offsetNum) || offsetNum < 0) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_OFFSET',
      message: 'Offset must be a non-negative number',
    });
  }
  
  req.query.limit = limitNum;
  req.query.offset = offsetNum;
  next();
};

// Validate UUID parameter
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const { error } = Joi.string().uuid().required().validate(uuid);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_UUID',
        message: `${paramName} must be a valid UUID`,
      });
    }
    
    next();
  };
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

module.exports = {
  validate,
  validatePagination,
  validateUUID,
  sanitizeInput,
  schemas: {
    user: userSchemas,
    post: postSchemas,
    modelProfile: modelProfileSchemas,
    purchase: purchaseSchemas,
    order: orderSchemas,
    fileUpload: fileUploadSchemas,
    common: commonSchemas,
  },
};
