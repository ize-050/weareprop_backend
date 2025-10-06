const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../middlewares/errorHandler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Export upload middleware for use in routes
const uploadProfileImage = upload.single('picture');

/**
 * User Controller - Handles HTTP requests for user operations
 */
class UserController {
  /**
   * Get current authenticated user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getCurrentUser(req, res, next) {
    try {
      const user_id = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          firstname: true,
          lastname: true,
          phoneAlt: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          facebook: true,
          instagram: true,
          role: true,
          picture: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Format response to include socialMedia like other endpoints
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        phoneAlt: user.phoneAlt,
        facebook: user.facebook || '',
        line: user.lineId || '',
        wechat: user.wechatId || '',
        whatsapp: user.whatsapp || '',
        instagram: user.instagram || '',
        picture: user.picture ? `/uploads/profiles/${user.picture}` : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return res.status(200).json({
        status: 'success',
        data: formattedUser
      });
    } catch (error) {
      next(error);
    }
  }



  /**
   * Change user password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      
      // Validate required fields
      if (!oldPassword || !newPassword) {
        throw new ApiError(400, 'Old password and new password are required');
      }
      
      // Validate new password length
      if (newPassword.length < 6) {
        throw new ApiError(400, 'New password must be at least 6 characters long');
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new ApiError(400, 'Incorrect old password');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role } = req.query;

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build filter conditions
      let where = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } }
        ];
      }

      if (role) {
        where.role = role;
      }

      // Get users with pagination
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          facebook: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });

      // Format the response to include socialMedia
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        socialMedia: {
          facebook: user.facebook || '',
          line: user.lineId || '',
          wechat: user.wechatId || '',
          whatsapp: user.whatsapp || ''
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      // Get total count for pagination
      const total = await prisma.user.count({ where });

      res.status(200).json({
        status: 'success',
        data: formattedUsers,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          facebook: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Format response to include socialMedia
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        socialMedia: {
          facebook: user.facebook || '',
          line: user.lineId || '',
          wechat: user.wechatId || '',
          whatsapp: user.whatsapp || ''
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: formattedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async createUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      const { name, email, password, role, phone, socialMedia } = req.body;

      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new ApiError(400, 'Email is already in use');
      }

      // Parse social media if it's a string
      let socialMediaData = {};
      if (socialMedia) {
        socialMediaData = typeof socialMedia === 'string'
          ? JSON.parse(socialMedia)
          : socialMedia;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'USER',
          phone,
          // Map social media fields
          facebook: socialMediaData.facebook || null,
          lineId: socialMediaData.line || null,
          wechatId: socialMediaData.wechat || null,
          whatsapp: socialMediaData.whatsapp || null
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          facebook: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Format response to include socialMedia
      const formattedUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        socialMedia: {
          facebook: newUser.facebook || '',
          line: newUser.lineId || '',
          wechat: newUser.wechatId || '',
          whatsapp: newUser.whatsapp || ''
        },
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      res.status(201).json({
        status: 'success',
        data: formattedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user's profile
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async updateCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      console.log("updateData", updateData);
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }

      // Check if email is already taken by another user
      if (updateData.email && updateData.email !== existingUser.email) {
        const userWithEmail = await prisma.user.findUnique({
          where: { email: updateData.email }
        });

        if (userWithEmail) {
          throw new ApiError(400, 'Email is already in use');
        }
      }

      // Remove password and id from update data for security
      delete updateData.password;
      delete updateData.id;
      delete updateData.role;
      
      // Handle picture update only if new file is uploaded
      if (req.file) {
        updateData.picture = req.file.filename;
      } else {
        // Don't update picture field if no new file is uploaded
        delete updateData.picture;
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          phoneAlt: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          facebook: true,
          instagram: true,
          role: true,
          picture: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Format response
      const formattedUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        phoneAlt: updatedUser.phoneAlt,
        role: updatedUser.role,
        socialMedia: {
          facebook: updatedUser.facebook || '',
          line: updatedUser.lineId || '',
          wechat: updatedUser.wechatId || '',
          whatsapp: updatedUser.whatsapp || '',
          instagram: updatedUser.instagram || ''
        },
        picture: updatedUser.picture ? `/uploads/profiles/${updatedUser.picture}` : null,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: formattedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async updateUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      const userId = parseInt(req.params.id);
      const { name, email, password, role, phone, firstname, lastname, facebook, line, wechat, whatsapp } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }

      // Check if email is already taken by another user
      if (email && email !== existingUser.email) {
        const userWithEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (userWithEmail) {
          throw new ApiError(400, 'Email is already in use');
        }
      }

      
      // Prepare update data - only include defined values
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (phone !== undefined) updateData.phone = phone;
      if (firstname !== undefined) updateData.firstname = firstname;
      if (lastname !== undefined) updateData.lastname = lastname;

      // Map social media fields - only if they exist in socialMediaData
      if (facebook !== undefined) updateData.facebook = facebook || null;
      if (line !== undefined) updateData.lineId = line || null;
      if (wechat !== undefined) updateData.wechatId = wechat || null;
      if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null;

      // Only update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      // Only proceed with update if there's data to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No valid fields provided for update'
        });
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          facebook: true,
          lineId: true,
          wechatId: true,
          whatsapp: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Format response to include socialMedia
      const formattedUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        socialMedia: {
          facebook: updatedUser.facebook || '',
          line: updatedUser.lineId || '',
          wechat: updatedUser.wechatId || '',
          whatsapp: updatedUser.whatsapp || ''
        },
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: formattedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }

      // Remove the self-deletion check since we're not using authentication anymore
      // if (userId === req.user.id) {
      //   throw new ApiError(400, 'Cannot delete your own account');
      // }

      // Delete user
      await prisma.user.delete({
        where: { id: userId }
      });

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
