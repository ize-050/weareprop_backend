const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ZoneRepository {
  /**
   * Get all zones
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of zones
   */
  async findAll(options = {}) {
    const { search, isActive } = options;
    
    // Create filter object based on options
    const filter = {};
    
    // Add isActive filter if provided
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    
    // Add search filter if provided
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    return prisma.zone.findMany({
      where: filter,
      orderBy: { name: 'asc' }
    });
  }
  
  /**
   * Find zone by ID
   * @param {number} id - Zone ID
   * @returns {Promise<Object|null>} Zone object or null
   */
  async findById(id) {
    return prisma.zone.findUnique({
      where: { id: Number(id) }
    });
  }
  
  /**
   * Create a new zone
   * @param {Object} data - Zone data
   * @returns {Promise<Object>} Created zone
   */
  async create(data) {
    return prisma.zone.create({ data });
  }
  
  /**
   * Update an existing zone
   * @param {number} id - Zone ID
   * @param {Object} data - Zone data
   * @returns {Promise<Object>} Updated zone
   */
  async update(id, data) {
    return prisma.zone.update({
      where: { id: Number(id) },
      data
    });
  }
  
  /**
   * Delete a zone
   * @param {number} id - Zone ID
   * @returns {Promise<Object>} Deleted zone
   */
  async delete(id) {
    return prisma.zone.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new ZoneRepository();
