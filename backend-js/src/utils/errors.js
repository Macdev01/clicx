/**
 * Custom API Error class for handling application-specific errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = null, isOperational = true) {
    super(message);
    
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error types for common scenarios
 */
class ValidationError extends ApiError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class BadRequestError extends ApiError {
  constructor(message) {
    super(message, 400, 'BAD_REQUEST');
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Error handler middleware factory
 */
const createErrorHandler = (logger) => {
  return (error, req, res, next) => {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let errors = null;

    // Handle ApiError instances
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
      code = error.code || 'API_ERROR';
      message = error.message;
      
      if (error instanceof ValidationError) {
        errors = error.errors;
      }
    }
    // Handle Sequelize validation errors
    else if (error.name === 'SequelizeValidationError') {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
    }
    // Handle Sequelize unique constraint errors
    else if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      code = 'CONFLICT';
      message = 'Resource already exists';
      errors = error.errors.map(err => ({
        field: err.path,
        message: `${err.path} must be unique`,
        value: err.value,
      }));
    }
    // Handle Sequelize foreign key constraint errors
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
      statusCode = 400;
      code = 'FOREIGN_KEY_CONSTRAINT';
      message = 'Invalid reference';
    }
    // Handle Sequelize database connection errors
    else if (error.name === 'SequelizeConnectionError') {
      statusCode = 503;
      code = 'DATABASE_CONNECTION_ERROR';
      message = 'Database connection failed';
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      code = 'INVALID_TOKEN';
      message = 'Invalid authentication token';
    }
    else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      code = 'TOKEN_EXPIRED';
      message = 'Authentication token expired';
    }

    // Log the error
    if (logger) {
      logger.error('API Error:', {
        error: error.message,
        stack: error.stack,
        statusCode,
        code,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
        requestId: req.requestId,
      });
    }

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const response = {
      status: 'error',
      code,
      message: isDevelopment ? message : (statusCode >= 500 ? 'Internal server error' : message),
      ...(errors && { errors }),
      ...(isDevelopment && { 
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    };

    res.status(statusCode).json(response);
  };
};

/**
 * Async error wrapper to catch async function errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  createErrorHandler,
  asyncHandler,
  notFoundHandler,
};
