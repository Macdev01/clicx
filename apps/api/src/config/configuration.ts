export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  app: {
    url: process.env.APP_URL || 'http://localhost:8080',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
  },
  bunny: {
    accessKey: process.env.BUNNY_ACCESS_KEY,
    storageZone: process.env.BUNNY_STORAGE_ZONE,
    storageHostname: process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com',
    pullZoneHostname: process.env.BUNNY_PULL_ZONE_HOSTNAME,
    signingKey: process.env.BUNNY_SIGNING_KEY,
    webhookSecret: process.env.BUNNY_WEBHOOK_SECRET,
    stream: {
      api: process.env.BUNNY_STREAM_API || 'https://video.bunnycdn.com',
      apiKey: process.env.BUNNY_STREAM_API_KEY,
      libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
      host: process.env.BUNNY_STREAM_HOST,
    },
  },
  plisio: {
    apiKey: process.env.PLISIO_API_KEY,
    secretKey: process.env.PLISIO_SECRET_KEY,
    webhookUrl: process.env.PLISIO_WEBHOOK_URL,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    filePath: process.env.LOG_FILE_PATH,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  monitoring: {
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '10000', 10),
  },
  queue: {
    redis: {
      host: process.env.QUEUE_REDIS_HOST || 'localhost',
      port: parseInt(process.env.QUEUE_REDIS_PORT || '6379', 10),
    },
    defaultRetries: parseInt(process.env.QUEUE_DEFAULT_RETRIES || '3', 10),
    defaultDelay: parseInt(process.env.QUEUE_DEFAULT_DELAY || '5000', 10),
  },
});