const blogRepository = require('../repositories/blogRepository');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Blog Service - จัดการการทำงานเกี่ยวกับบทความ
 */
class BlogService {
  /**
   * สร้างบทความใหม่
   * @param {Object} data ข้อมูลบทความ
   * @param {number} userId ID ของผู้ใช้ที่สร้างบทความ
   * @returns {Promise<Object>} บทความที่สร้าง
   */
  async createBlog(data, userId) {
    // เพิ่ม userId ให้กับข้อมูล
    data.userId = userId;
    
    // สร้างบทความใหม่
    return await blogRepository.createBlog(data);
  }
  
  /**
   * อัปเดตบทความ
   * @param {number} id ID ของบทความ
   * @param {Object} data ข้อมูลที่ต้องการอัปเดต
   * @param {number} userId ID ของผู้ใช้ที่อัปเดตบทความ
   * @returns {Promise<Object>} บทความที่อัปเดต
   */
  async updateBlog(id, data, userId) {
    // ตรวจสอบว่าบทความมีอยู่หรือไม่
    const blog = await blogRepository.getBlogById(id);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }

    // อัปเดตบทความ
    return await blogRepository.updateBlog(id, data);
  }
  
  /**
   * ลบบทความ
   * @param {number} id ID ของบทความ
   * @param {number} userId ID ของผู้ใช้ที่ลบบทความ
   * @returns {Promise<Object>} บทความที่ลบ
   */
  async deleteBlog(id, userId) {
    // ตรวจสอบว่าบทความมีอยู่หรือไม่

    const blog = await blogRepository.getBlogById(id);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }


    
    // ลบบทความ
    return await blogRepository.deleteBlog(id);
  }
  
  /**
   * ดึงข้อมูลบทความตาม ID
   * @param {number} id ID ของบทความ
   * @returns {Promise<Object>} บทความ
   */
  async getBlogById(id) {
    const blog = await blogRepository.getBlogById(id);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
    return blog;
  }
  
  /**
   * ดึงข้อมูลบทความตาม slug
   * @param {string} slug Slug ของบทความ
   * @returns {Promise<Object>} บทความ
   */
  async getBlogBySlug(slug) {
    const blog = await blogRepository.getBlogBySlug(slug);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
    
    // ถ้าบทความเป็นฉบับร่าง ให้ตรวจสอบสิทธิ์ (ต้องส่ง userId มาด้วย)
    if (blog.status === 'DRAFT') {
      throw new ApiError(403, 'This blog is not published yet');
    }
    
    return blog;
  }
  
  /**
   * ดึงรายการบทความทั้งหมด
   * @param {Object} options ตัวเลือกในการดึงข้อมูล
   * @returns {Promise<Object>} รายการบทความและข้อมูลการแบ่งหน้า
   */
  async getAllBlogs(options = {}) {
    return await blogRepository.getAllBlogs(options);
  }
  
  /**
   * ดึงรายการบทความของผู้ใช้
   * @param {number} userId ID ของผู้ใช้
   * @param {Object} options ตัวเลือกในการดึงข้อมูล
   * @returns {Promise<Object>} รายการบทความและข้อมูลการแบ่งหน้า
   */
  async getUserBlogs(userId, options = {}) {
    options.userId = userId;
    return await blogRepository.getAllBlogs(options);
  }
  
  /**
   * ดึงรายการบทความที่เผยแพร่แล้วล่าสุด
   * @param {number} limit จำนวนบทความที่ต้องการ
   * @returns {Promise<Array>} รายการบทความ
   */
  async getLatestPublishedBlogs(limit = 5) {
    return await blogRepository.getLatestPublishedBlogs(limit);
  }
  
  /**
   * ดึงรายการบทความยอดนิยม (มีการเข้าชมมากที่สุด)
   * @param {number} limit จำนวนบทความที่ต้องการ
   * @returns {Promise<Array>} รายการบทความ
   */
  async getPopularBlogs(limit = 5) {
    return await blogRepository.getPopularBlogs(limit);
  }
}

module.exports = new BlogService();
