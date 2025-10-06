const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for profile image uploads


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Check image request 
    if (!file) {
      cb(null, null);
    }
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

// Main route to get all users
router.get('/', authenticate, userController.getAllUsers);

// Get current user profile
router.get('/me', authenticate, userController.getCurrentUser);

// Update current user profile with optional image upload
router.put('/me', authenticate, upload.single('picture'), userController.updateCurrentUser);

// Change password (will return auth error)
router.put('/me/password', authenticate, userController.changePassword);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Create user
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Invalid role'),
    body('phone').optional(),
  ],
  userController.createUser
);

// Update user
router.put(
  '/:id',
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Invalid role'),
  ],
  userController.updateUser
);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
