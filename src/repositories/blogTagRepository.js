const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

/**
 * Blog Tag Repository - จัดการข้อมูลแท็กบทความในฐานข้อมูล
 */
class BlogTagRepository {
  /**
   * สร้างแท็กบทความใหม่
   * @param {Object} data ข้อมูลแท็ก
   * @returns {Promise<Object>} แท็กที่สร้าง
   */
  async createTag(data) {
    // สร้าง slug จากชื่อแท็กภาษาอังกฤษ
    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const existingTag = await prisma.blogTag.findUnique({
      where: { slug }
    });
    
    // ถ้า slug ซ้ำ ให้เพิ่มตัวเลขต่อท้าย
    let finalSlug = slug;
    if (existingTag) {
      finalSlug = `${slug}-${Date.now()}`;
    }
    
    // สร้างข้อมูล translatedNames
    const translatedNames = {};
    
    if (data.th) translatedNames.th = data.th;
    if (data.zh) translatedNames.zh = data.zh;
    if (data.ru) translatedNames.ru = data.ru;
    
    // สร้างแท็กใหม่
    return await prisma.blogTag.create({
      data: {
        name: data.name,
        slug: finalSlug,
        translatedNames: Object.keys(translatedNames).length > 0 ? translatedNames : undefined
      }
    });
  }
  
  /**
   * อัปเดตแท็กบทความ
   * @param {number} id ID ของแท็ก
   * @param {Object} data ข้อมูลที่ต้องการอัปเดต
   * @returns {Promise<Object>} แท็กที่อัปเดต
   */
  async updateTag(id, data) {
    // ตรวจสอบว่าแท็กมีอยู่หรือไม่
    const existingTag = await prisma.blogTag.findUnique({
      where: { id }
    });
    
    if (!existingTag) {
      throw new Error('Tag not found');
    }
    
    // สร้างข้อมูลสำหรับอัปเดต
    const updateData = {};
    
    // อัปเดตชื่อและ slug ถ้ามีการเปลี่ยนแปลง
    if (data.name && data.name !== existingTag.name) {
      updateData.name = data.name;
      
      // สร้าง slug ใหม่
      const slug = slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      // ตรวจสอบว่า slug ซ้ำหรือไม่
      const duplicateSlug = await prisma.blogTag.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });
      
      // ถ้า slug ซ้ำ ให้เพิ่มตัวเลขต่อท้าย
      updateData.slug = duplicateSlug ? `${slug}-${Date.now()}` : slug;
    }
    
    // อัปเดตข้อมูลหลายภาษา
    const translatedNames = { ...existingTag.translatedNames };
    
    if (data.th !== undefined) translatedNames.th = data.th;
    if (data.zh !== undefined) translatedNames.zh = data.zh;
    if (data.ru !== undefined) translatedNames.ru = data.ru;
    
    updateData.translatedNames = translatedNames;
    
    // อัปเดตแท็ก
    return await prisma.blogTag.update({
      where: { id },
      data: updateData
    });
  }
  
  /**
   * ลบแท็กบทความ
   * @param {number} id ID ของแท็ก
   * @returns {Promise<Object>} แท็กที่ลบ
   */
  async deleteTag(id) {
    // ลบความสัมพันธ์กับบทความทั้งหมด
    await prisma.blogTag.update({
      where: { id },
      data: {
        blogs: {
          set: [] // ลบความสัมพันธ์ทั้งหมด
        }
      }
    });
    
    // ลบแท็ก
    return await prisma.blogTag.delete({
      where: { id }
    });
  }
  
  /**
   * ดึงข้อมูลแท็กบทความตาม ID
   * @param {number} id ID ของแท็ก
   * @returns {Promise<Object>} แท็ก
   */
  async getTagById(id) {
    return await prisma.blogTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { blogs: true }
        }
      }
    });
  }
  
  /**
   * ดึงข้อมูลแท็กบทความตาม slug
   * @param {string} slug Slug ของแท็ก
   * @returns {Promise<Object>} แท็ก
   */
  async getTagBySlug(slug) {
    return await prisma.blogTag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { blogs: true }
        }
      }
    });
  }
  
  /**
   * ดึงรายการแท็กบทความทั้งหมด
   * @returns {Promise<Array>} รายการแท็ก
   */
  async getAllTags() {
    return await prisma.blogTag.findMany({
      include: {
        _count: {
          select: { blogs: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
  
  /**
   * ดึงแท็กยอดนิยม (มีบทความมากที่สุด)
   * @param {number} limit จำนวนแท็กที่ต้องการ
   * @returns {Promise<Array>} รายการแท็ก
   */
  async getPopularTags(limit = 10) {
    return await prisma.blogTag.findMany({
      include: {
        _count: {
          select: { blogs: true }
        }
      },
      orderBy: {
        blogs: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });
  }
}

module.exports = new BlogTagRepository();
