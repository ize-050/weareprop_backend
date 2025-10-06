const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Authenticate a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object|null} User object if authenticated, null otherwise
 */
const authenticateUser = async (email, password) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, return null
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // If password is invalid, return null
    if (!isPasswordValid) {
      return null;
    }

    // Return user if authenticated
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Object|null} User object if found, null otherwise
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createUser = async (userData) => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
    
    return user;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

module.exports = {
  authenticateUser,
  getUserById,
  createUser
};
