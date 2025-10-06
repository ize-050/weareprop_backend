const blogService = require('../services/blogService');
const { ApiError } = require('../middlewares/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Blog Controller - จัดการ HTTP requests สำหรับบทความ
 */
class BlogController {
  /**
   * ดึงรายการบทความทั้งหมด
   * @route GET /api/blogs
   */
  async getAllBlogs(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        category: req.query.category,
        tag: req.query.tag,
        search: req.query.search,
        orderBy: req.query.orderBy || 'createdAt',
        order: req.query.order || 'desc'
      };

      const blogs = await blogService.getAllBlogs(options);

      res.status(200).json({
        status: 'success',
        data: blogs.data,
        pagination: blogs.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ดึงบทความตาม ID
   * @route GET /api/blogs/:id
   */
  async getBlogById(req, res, next) {
    try {
      const blog = await blogService.getBlogById(parseInt(req.params.id));

      res.status(200).json({
        status: 'success',
        data: blog
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ดึงบทความตาม slug
   * @route GET /api/blogs/slug/:slug
   */
  async getBlogBySlug(req, res, next) {
    try {
      console.log('Fetching blog with slug:', req.params.slug);
      const blog = await blogService.getBlogBySlug(req.params.slug);

      res.status(200).json({
        status: 'success',
        data: blog
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * สร้างบทความใหม่
   * @route POST /api/blogs
   */
  async createBlog(req, res, next) {
    try {
      // ตรวจสอบการ validate
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      
      const userId = req.user.userId;

    
      // สร้างบทความใหม่
      const blog = await blogService.createBlog(req.body, userId);

      res.status(201).json({
        status: 'success',
        message: 'Blog created successfully',
        data: blog
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  /**
   * อัปเดตบทความ
   * @route PUT /api/blogs/:id
   */
  async updateBlog(req, res, next) {
    try {
      // ตรวจสอบการ validate
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      // อัปเดตบทความ
      const blog = await blogService.updateBlog(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );

      res.status(200).json({
        status: 'success',
        message: 'Blog updated successfully',
        data: blog
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ลบบทความ
   * @route DELETE /api/blogs/:id
   */
  async deleteBlog(req, res, next) {
    try {
      await blogService.deleteBlog(parseInt(req.params.id), req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Blog deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ดึงบทความล่าสุดที่เผยแพร่แล้ว
   * @route GET /api/blogs/latest
   */
  async getLatestBlogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const blogs = await blogService.getLatestPublishedBlogs(limit);

      res.status(200).json({
        status: 'success',
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ดึงบทความยอดนิยม
   * @route GET /api/blogs/popular
   */
  async getPopularBlogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const blogs = await blogService.getPopularBlogs(limit);

      res.status(200).json({
        status: 'success',
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ดึงบทความของผู้ใช้ที่ล็อกอินอยู่
   * @route GET /api/blogs/my-blogs
   */
  async getMyBlogs(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        category: req.query.category,
        tag: req.query.tag,
        search: req.query.search,
        orderBy: req.query.orderBy || 'createdAt',
        order: req.query.order || 'desc'
      };

      const blogs = await blogService.getUserBlogs(req.user.id, options);

      res.status(200).json({
        status: 'success',
        data: blogs.data,
        pagination: blogs.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BlogController();
