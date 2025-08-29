const admin = require('firebase-admin');
const logger = require('../utils/logger');
const { User, sequelize } = require('../models');
const { generateSecurePassword } = require('../utils/crypto');

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin initialized');
  }
  return admin;
};

// Get or create user from Firebase token
const getOrCreateUser = async (decodedToken, referralCode = null) => {
  try {
    const { email, picture, uid } = decodedToken;
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      const securePassword = generateSecurePassword();
      const nickname = generateNickname(email);
      
      user = await User.create({
        email,
        nickname,
        password: securePassword,
        avatarUrl: picture,
        firebaseUid: uid,
        isEmailVerified: decodedToken.email_verified || false,
        referralCode: referralCode,
      });

      // Handle referral if provided
      if (referralCode) {
        // Use transaction to prevent race conditions
        const t = await sequelize.transaction();
        try {
          const referrer = await User.findOne({ 
            where: { referralCode },
            lock: t.LOCK.UPDATE,
            transaction: t 
          });
          
          if (referrer) {
            // Create referral record
            const { Referral } = require('../models');
            await Referral.create({
              userId: referrer.id,
              referralCode,
              invitedUserId: user.id,
            }, { transaction: t });
            
            // Update referrer balance atomically
            await referrer.increment('balance', { by: 1, transaction: t });
            
            await t.commit();
          } else {
            await t.rollback();
          }
        } catch (error) {
          await t.rollback();
          logger.error('Error handling referral:', error);
          // Don't throw - we don't want to fail user creation due to referral issues
        }
      }

      logger.info(`New user created: ${email}`);
    } else {
      // Update existing user
      await user.update({
        avatarUrl: picture,
        firebaseUid: uid,
        isEmailVerified: decodedToken.email_verified || false,
        lastLoginAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    logger.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const admin = initializeFirebase();
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get referral code from header
    const referralCode = req.headers['x-referral-code'];
    
    // Get or create user
    const user = await getOrCreateUser(decodedToken, referralCode);
    
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Invalid Firebase token:', error.message);
    return next(); // Continue without user
  }
};

// Require authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  next();
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  next();
};

// Helper function to generate nickname from email
const generateNickname = (email) => {
  const base = email.split('@')[0];
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}${randomSuffix}`;
};

module.exports = {
  authenticateUser,
  requireAuth,
  requireAdmin,
  initializeFirebase,
};
