const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthService {
  static generateToken(userId) {
    return jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  static generateValidationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = AuthService;