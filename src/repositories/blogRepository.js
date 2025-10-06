const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

/**
 * Blog Repository - จัดการข้อมูล Blog ในฐานข้อมูล
 */
class BlogRepository {
  /**
   * สร้าง Blog ใหม่
   * @param {Object} data ข้อมูล Blog
   * @returns {Promise<Object>} Blog ที่สร้าง
   */
  async createBlog(data) {
   try{
    const slug = slugify(data.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });
    
    // ถ้า slug ซ้ำ ให้เพิ่มตัวเลขต่อท้าย
    let finalSlug = slug;
    if (existingBlog) {
      finalSlug = `${slug}-${Date.now()}`;
    }
    
    // สร้างข้อมูล translatedTitles และ translatedContents
    
    // แก้ไข: ตรวจสอบว่าข้อมูลที่ได้รับมาเป็น JSON string หรือไม่
    let translatedTitles, translatedContents;
    
    try {
      // ถ้าเป็น JSON string ให้แปลงเป็น object
      if (data.translated_titles) {
        translatedTitles = typeof data.translated_titles === 'string' 
          ? JSON.parse(data.translated_titles) 
          : data.translated_titles;
      }
      
      if (data.translated_contents) {
        translatedContents = typeof data.translated_contents === 'string' 
          ? JSON.parse(data.translated_contents)
          : data.translated_contents;
      }
    } catch (error) {
      console.error('Error parsing translations:', error);
      throw new Error('Invalid JSON format in translations');
    }
    
    // สร้าง Blog ใหม่
    const blog = await prisma.blog.create({
      data: {
        title: data.title || '',
        content: data.content || '',
        slug: finalSlug,
        status: 'PUBLISHED',
        translatedTitles: translatedTitles ? JSON.stringify(translatedTitles) : null,
        translatedContents: translatedContents ? JSON.stringify(translatedContents) : null,
        featuredImage: data.featuredImage,
        category: data.category || null,
        tags: data.tags || null,
        userId: data.userId,
        publishedAt: new Date(),
      }
    });
    
    return blog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
  }
  
  /**
   * อัปเดต Blog
   * @param {number} id ID ของ Blog
   * @param {Object} data ข้อมูลที่ต้องการอัปเดต
   * @returns {Promise<Object>} Blog ที่อัปเดต
   */
  async updateBlog(id, data) {
    // ตรวจสอบว่า Blog มีอยู่หรือไม่
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });
    
    if (!existingBlog) {
      throw new Error('Blog not found');
    }
    
    // สร้างข้อมูลสำหรับอัปเดต
    const updateData = {};
    
    // อัปเดตข้อมูลพื้นฐาน
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.status) {
      updateData.status = data.status;
      // ถ้าเปลี่ยนสถานะเป็น PUBLISHED และยังไม่เคยตั้งค่า publishedAt
      if (data.status === 'PUBLISHED' && !existingBlog.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (data.featuredImage) updateData.featuredImage = data.featuredImage;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    
    // อัปเดตข้อมูลหลายภาษา
    // Parse existing translated data from JSON strings
    let translatedTitles = {};
    let translatedContents = {};
    
    try {
      if (existingBlog.translatedTitles) {
        translatedTitles = typeof existingBlog.translatedTitles === 'string' 
          ? JSON.parse(existingBlog.translatedTitles) 
          : existingBlog.translatedTitles;
      }
      
      if (existingBlog.translatedContents) {
        translatedContents = typeof existingBlog.translatedContents === 'string' 
          ? JSON.parse(existingBlog.translatedContents) 
          : existingBlog.translatedContents;
      }
    } catch (error) {
      console.error('Error parsing existing translations:', error);
      // Use empty objects if parsing fails
      translatedTitles = {};
      translatedContents = {};
    }
    
    if (data.th) {
      if (data.th.title) translatedTitles.th = data.th.title;
      if (data.th.content) translatedContents.th = data.th.content;
    }
    
    if (data.zh) {
      if (data.zh.title) translatedTitles.zh = data.zh.title;
      if (data.zh.content) translatedContents.zh = data.zh.content;
    }
    
    if (data.ru) {
      if (data.ru.title) translatedTitles.ru = data.ru.title;
      if (data.ru.content) translatedContents.ru = data.ru.content;
    }

      if (data.title) translatedTitles.en = data.title;
      if (data.content) translatedContents.en = data.content;



    updateData.translatedTitles = translatedTitles ? JSON.stringify(translatedTitles) : null;
    updateData.translatedContents = translatedContents ? JSON.stringify(translatedContents) : null;
    
    // อัปเดต Blog
    const blog = await prisma.blog.update({
      where: { id },
      data: updateData
    });
    
    return blog;
  }
  
  /**
   * ลบ Blog
   * @param {number} id ID ของ Blog
   * @returns {Promise<Object>} Blog ที่ลบ
   */
  async deleteBlog(id) {
    return await prisma.blog.delete({
      where: { id }
    });
  }
  
  /**
   * ดึงข้อมูล Blog ตาม ID
   * @param {number} id ID ของ Blog
   * @returns {Promise<Object>} Blog
   */
  async getBlogById(id) {
    return await prisma.blog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }
  
  /**
   * ดึงข้อมูล Blog ตาม slug
   * @param {string} slug Slug ของ Blog
   * @returns {Promise<Object>} Blog
   */
  async getBlogBySlug(slug) {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // ถ้าเป็นบทความที่เผยแพร่แล้ว ให้เพิ่มจำนวนการเข้าชม
    if (blog && blog.status === 'PUBLISHED') {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { viewCount: blog.viewCount + 1 }
      });
    }
    
    return blog;
  }
  
  /**
   * ดึงรายการ Blog ทั้งหมด
   * @param {Object} options ตัวเลือกในการดึงข้อมูล
   * @returns {Promise<Object>} รายการ Blog และข้อมูลการแบ่งหน้า
   */
  async getAllBlogs(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      tag,
      search,
      userId,
      orderBy = 'createdAt',
      order = 'desc'
    } = options;
    
    // สร้างเงื่อนไขในการค้นหา
    const where = {};
    
    // กรองตามสถานะ
    if (status) {
      where.status = status;
    }
    
    // กรองตามหมวดหมู่
    if (category) {
      where.category = {
        contains: category
      };
    }
    
    // กรองตามผู้ใช้
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    // กรองตาม tag
    if (tag) {
      where.tags = {
        contains: tag
      };
    }
    
    // ค้นหาตามชื่อบทความ
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }
    
    // คำนวณ offset สำหรับการแบ่งหน้า
    const skip = (page - 1) * limit;
    
    // ดึงจำนวนบทความทั้งหมด
    const total = await prisma.blog.count({ where });
    
    // ดึงรายการบทความ
    const blogs = await prisma.blog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        [orderBy]: order
      },
      skip,
      take: parseInt(limit)
    });
    
    // คำนวณข้อมูลการแบ่งหน้า
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  }
  
  /**
   * ดึงรายการ Blog ที่เผยแพร่แล้วล่าสุด
   * @param {number} limit จำนวนบทความที่ต้องการ
   * @returns {Promise<Array>} รายการ Blog
   */
  async getLatestPublishedBlogs(limit = 5) {
    return await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: parseInt(limit)
    });
  }
  
  /**
   * ดึงรายการ Blog ยอดนิยม (มีการเข้าชมมากที่สุด)
   * @param {number} limit จำนวนบทความที่ต้องการ
   * @returns {Promise<Array>} รายการ Blog
   */
  async getPopularBlogs(limit = 5) {
    return await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: parseInt(limit)
    });
  }
}

module.exports = new BlogRepository();
