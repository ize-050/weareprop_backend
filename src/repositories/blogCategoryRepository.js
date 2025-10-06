const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

/**
 * Blog Category Repository - จัดการข้อมูลหมวดหมู่บทความในฐานข้อมูล
 */
class BlogCategoryRepository {
  /**
   * สร้างหมวดหมู่บทความใหม่
   * @param {Object} data ข้อมูลหมวดหมู่
   * @returns {Promise<Object>} หมวดหมู่ที่สร้าง
   */
  async createCategory(data) {
    // สร้าง slug จากชื่อหมวดหมู่ภาษาอังกฤษ
    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    });
    
    // ถ้า slug ซ้ำ ให้เพิ่มตัวเลขต่อท้าย
    let finalSlug = slug;
    if (existingCategory) {
      finalSlug = `${slug}-${Date.now()}`;
    }
    
    // สร้างข้อมูล translatedNames
    const translatedNames = {};
    
    if (data.th) translatedNames.th = data.th;
    if (data.zh) translatedNames.zh = data.zh;
    if (data.ru) translatedNames.ru = data.ru;
    
    // สร้างหมวดหมู่ใหม่
    return await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: finalSlug,
        translatedNames: Object.keys(translatedNames).length > 0 ? translatedNames : undefined
      }
    });
  }
  
  /**
   * อัปเดตหมวดหมู่บทความ
   * @param {number} id ID ของหมวดหมู่
   * @param {Object} data ข้อมูลที่ต้องการอัปเดต
   * @returns {Promise<Object>} หมวดหมู่ที่อัปเดต
   */
  async updateCategory(id, data) {
    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    // สร้างข้อมูลสำหรับอัปเดต
    const updateData = {};
    
    // อัปเดตชื่อและ slug ถ้ามีการเปลี่ยนแปลง
    if (data.name && data.name !== existingCategory.name) {
      updateData.name = data.name;
      
      // สร้าง slug ใหม่
      const slug = slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      // ตรวจสอบว่า slug ซ้ำหรือไม่
      const duplicateSlug = await prisma.blogCategory.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });
      
      // ถ้า slug ซ้ำ ให้เพิ่มตัวเลขต่อท้าย
      updateData.slug = duplicateSlug ? `${slug}-${Date.now()}` : slug;
    }
    
    // อัปเดตข้อมูลหลายภาษา
    const translatedNames = { ...existingCategory.translatedNames };
    
    if (data.th !== undefined) translatedNames.th = data.th;
    if (data.zh !== undefined) translatedNames.zh = data.zh;
    if (data.ru !== undefined) translatedNames.ru = data.ru;
    
    updateData.translatedNames = translatedNames;
    
    // อัปเดตหมวดหมู่
    return await prisma.blogCategory.update({
      where: { id },
      data: updateData
    });
  }
  
  /**
   * ลบหมวดหมู่บทความ
   * @param {number} id ID ของหมวดหมู่
   * @returns {Promise<Object>} หมวดหมู่ที่ลบ
   */
  async deleteCategory(id) {
    // ตรวจสอบว่ามีบทความในหมวดหมู่นี้หรือไม่
    const blogCount = await prisma.blog.count({
      where: { categoryId: id }
    });
    
    if (blogCount > 0) {
      throw new Error('Cannot delete category with associated blogs');
    }
    
    return await prisma.blogCategory.delete({
      where: { id }
    });
  }
  
  /**
   * ดึงข้อมูลหมวดหมู่บทความตาม ID
   * @param {number} id ID ของหมวดหมู่
   * @returns {Promise<Object>} หมวดหมู่
   */
  async getCategoryById(id) {
    return await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { blogs: true }
        }
      }
    });
  }
  
  /**
   * ดึงข้อมูลหมวดหมู่บทความตาม slug
   * @param {string} slug Slug ของหมวดหมู่
   * @returns {Promise<Object>} หมวดหมู่
   */
  async getCategoryBySlug(slug) {
    return await prisma.blogCategory.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { blogs: true }
        }
      }
    });
  }
  
  /**
   * ดึงรายการหมวดหมู่บทความทั้งหมด
   * @returns {Promise<Array>} รายการหมวดหมู่
   */
  async getAllCategories() {
    return await prisma.blogCategory.findMany({
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
}

module.exports = new BlogCategoryRepository();
