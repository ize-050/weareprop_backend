const express = require('express');
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware');
const { blogValidationSchema } = require('../validations/blogSchema');
const { handleBlogImageUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// ===== Blog Routes =====

// Public routes - ไม่ต้องล็อกอิน
router.get('/', blogController.getAllBlogs);
router.get('/latest', blogController.getLatestBlogs);
router.get('/popular', blogController.getPopularBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id', blogController.getBlogById);

// Protected routes - ต้องล็อกอิน
router.post('/', 
  authMiddleware.authenticate,
  handleBlogImageUpload,
  blogValidationSchema,
  blogController.createBlog
);

router.put('/:id', 
  authMiddleware.authenticate,
  handleBlogImageUpload,
  blogValidationSchema,
  blogController.updateBlog
);

router.delete('/:id', 
  authMiddleware.authenticate,
  blogController.deleteBlog
);

router.get('/my-blogs', 
  authMiddleware.authenticate,
  blogController.getMyBlogs
);

module.exports = router;
