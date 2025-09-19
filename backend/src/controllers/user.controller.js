const authService = require('../services/auth.service');
const User = require('../models/User');
const Joi = require('joi');

class UserController {
  /**
   * Register a new user
   * POST /api/users/register
   */
  async register(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      // Register user
      const result = await authService.register(value);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });

    } catch (error) {
      console.error('Register error:', error);
      
      if (error.message === 'User already exists with this email') {
        return res.status(409).json({
          error: 'User already exists',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Login user
   * POST /api/users/login
   */
  async login(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      // Login user
      const result = await authService.login(value);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      res.status(500).json({
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/users/refresh-token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Missing refresh token',
          message: 'Refresh token is required'
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      
      res.status(401).json({
        error: 'Token refresh failed',
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  async getProfile(req, res) {
    try {
      const user = req.user; // Set by auth middleware

      res.json({
        success: true,
        data: {
          user: user.getPublicProfile()
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async updateProfile(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        name: Joi.string().min(2).max(50),
        avatar: Joi.string().uri(),
        preferences: Joi.object({
          defaultCategory: Joi.string().valid('groceries', 'restaurant', 'gas', 'retail', 'pharmacy', 'other'),
          currency: Joi.string(),
          autoCategorizationEnabled: Joi.boolean(),
          theme: Joi.string().valid('light', 'dark', 'auto')
        })
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: value },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.getPublicProfile()
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  /**
   * Change password
   * PUT /api/users/change-password
   */
  async changePassword(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      await authService.changePassword(
        req.user._id,
        value.currentPassword,
        value.newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          error: 'Invalid password',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Failed to change password',
        message: error.message
      });
    }
  }

  /**
   * Logout user
   * POST /api/users/logout
   */
  async logout(req, res) {
    try {
      await authService.logout(req.user._id);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Delete user account
   * DELETE /api/users/account
   */
  async deleteAccount(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        password: Joi.string().required(),
        confirmDeletion: Joi.boolean().valid(true).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      // Verify password
      const user = await User.findById(req.user._id).select('+password');
      const isPasswordValid = await user.comparePassword(value.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password is incorrect'
        });
      }

      // Soft delete (deactivate account)
      await User.findByIdAndUpdate(req.user._id, {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        error: 'Failed to delete account',
        message: error.message
      });
    }
  }

  /**
   * Get user stats
   * GET /api/users/stats
   */
  async getUserStats(req, res) {
    try {
      const Receipt = require('../models/Receipt');
      
      const stats = await Receipt.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalReceipts: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            avgReceiptAmount: { $avg: '$total' },
            categoriesUsed: { $addToSet: '$category' }
          }
        }
      ]);

      const userStats = stats[0] || {
        totalReceipts: 0,
        totalSpent: 0,
        avgReceiptAmount: 0,
        categoriesUsed: []
      };

      res.json({
        success: true,
        data: {
          user: req.user.getPublicProfile(),
          stats: userStats
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to get user stats',
        message: error.message
      });
    }
  }
}

module.exports = new UserController();