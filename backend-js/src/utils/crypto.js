const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a secure random password
 * @returns {string} A secure random password
 */
const generateSecurePassword = () => {
  const length = 32;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(crypto.randomInt(0, charset.length));
  }
  
  return password;
};

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 * @param {string} password - The password to check
 * @param {string} hash - The hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} A secure random token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a referral code
 * @param {number} length - Length of the referral code (default: 8)
 * @returns {string} A referral code
 */
const generateReferralCode = (length = 8) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += charset.charAt(crypto.randomInt(0, charset.length));
  }
  
  return code;
};

/**
 * Generate a UUID v4
 * @returns {string} A UUID v4 string
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Create a hash of data
 * @param {string} data - Data to hash
 * @param {string} algorithm - Hash algorithm (default: 'sha256')
 * @returns {string} The hash
 */
const createHash = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @param {string} charset - Character set to use
 * @returns {string} A random string
 */
const generateRandomString = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(crypto.randomInt(0, charset.length));
  }
  return result;
};

module.exports = {
  generateSecurePassword,
  hashPassword,
  comparePassword,
  generateSecureToken,
  generateReferralCode,
  generateUUID,
  createHash,
  generateRandomString,
};
