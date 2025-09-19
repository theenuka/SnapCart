const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'snapcart-fallback-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'snapcart-refresh-secret-change-in-production';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  }

  /**
   * Generate JWT access token
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'snapcart',
      audience: 'snapcart-users'
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - Token payload
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
      issuer: 'snapcart',
      audience: 'snapcart-users'
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Token pair
   */
  generateTokenPair(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      name: user.name
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.jwtExpiresIn
    };
  }

  /**
   * Verify JWT access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'snapcart',
        audience: 'snapcart-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify JWT refresh token
   * @param {string} token - JWT refresh token
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'snapcart',
        audience: 'snapcart-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User and tokens
   */
  async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // Generate tokens
      const tokens = this.generateTokenPair(user);

      return {
        user: user.getPublicProfile(),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Object} User and tokens
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Find user with password
      const user = await User.findByEmailWithPassword(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const tokens = this.generateTokenPair(user);

      return {
        user: user.getPublicProfile(),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: user._id,
        email: user.email,
        name: user.name
      });

      return {
        accessToken,
        expiresIn: this.jwtExpiresIn
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by token
   * @param {string} token - JWT token
   * @returns {Object} User object
   */
  async getUserByToken(token) {
    try {
      const decoded = this.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user (in a real app, you'd invalidate the tokens)
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  async logout(userId) {
    try {
      // In a production app, you might want to:
      // 1. Add tokens to a blacklist
      // 2. Update user's last logout time
      // 3. Clear any session data
      
      // For now, we'll just update the user record
      await User.findByIdAndUpdate(userId, {
        lastLoginAt: null
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();