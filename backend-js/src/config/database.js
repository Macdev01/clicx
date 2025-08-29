const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const fs = require('fs');

// Helper function to get SSL configuration
const getSSLConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }
  
  // For production, properly configure SSL
  const sslConfig = {
    require: true,
    rejectUnauthorized: true,
  };
  
  // If using a custom CA certificate (e.g., for managed databases)
  if (process.env.DB_SSL_CA_PATH) {
    try {
      sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
    } catch (error) {
      logger.warn('Could not read SSL CA certificate, using default trust store');
    }
  }
  
  // Allow override for development/testing (but log a security warning)
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
    logger.warn('⚠️  WARNING: SSL certificate validation is disabled. This is insecure!');
    sslConfig.rejectUnauthorized = false;
  }
  
  return sslConfig;
};

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    ssl: false, // SSL disabled for local development
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'clixxx_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ssl: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ssl: getSSLConfig(),
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    ssl: dbConfig.ssl,
    pool: dbConfig.pool,
    timezone: '+07:00', // Asia/Bangkok
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
