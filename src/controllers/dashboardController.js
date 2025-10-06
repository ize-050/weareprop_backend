const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../utils/errorHandler');

class DashboardController {
  async getDashboardStats(req, res) {
    try {
      // Get user ID if authenticated
      const userId = req.user?.userId;
      
      // Metrics to collect
      let totalProperties = 0;
      let totalMessages = 0;
      let newMessages = 0;
      let propertiesByType = [];
      let messagesByType = [];
      let messagesByStatus = [];
      let recentMessages = [];

      // If user is authenticated, get their properties count and messages
      if (userId) {
        // For user-specific dashboard
        const [userPropertiesCount, userPropertiesByType, userMessages, userMessagesByStatus, userMessagesByType, userRecentMessages] = await Promise.all([
          // Total properties by this user
          prisma.property.count({
            where: { userId: parseInt(userId) }
          }),
          
          // Properties by type (simple groupBy)
          prisma.property.groupBy({
            by: ['propertyTypeId'],
            where: { userId: parseInt(userId) },
            _count: {
              propertyTypeId: true
            }
          }),
          
          // Messages for user's properties
          prisma.$transaction(async (tx) => {
            // First get all properties that belong to this user
            const userProperties = await tx.property.findMany({
              where: { userId: parseInt(userId) },
              select: { id: true },
            });
            
            // Extract property IDs
            const propertyIds = userProperties.map(prop => prop.id);
            
            // Count total messages for these properties
            return tx.message.count({
              where: {
                propertyId: { in: propertyIds }
              }
            });
          }),
          
          // Messages by status
          prisma.$transaction(async (tx) => {
            // First get all properties that belong to this user
            const userProperties = await tx.property.findMany({
              where: { userId: parseInt(userId) },
              select: { id: true }
            });
            
            // Extract property IDs
            const propertyIds = userProperties.map(prop => prop.id);

            if (propertyIds.length === 0) {
              // Return empty result if no properties
              return [];
            }

            // Use the simpler form of Prisma query for status counts
            const statusCounts = await tx.message.groupBy({
              by: ['status'],
              where: {
                propertyId: { in: propertyIds }
              },
              _count: {
                status: true
              }
            });
            
            // Transform to match expected format
            return statusCounts.map(item => ({
              status: item.status,
              count: item._count.status
            }));
          }),
          
          // Messages by property type
          prisma.$transaction(async (tx) => {
            // First get all properties that belong to this user
            const properties = await tx.property.findMany({
              where: { userId: parseInt(userId) },
              select: { id: true, propertyType: true }
            });
            
            if (properties.length === 0) {
              return [];
            }
            
            // Group properties by type
            const propertyTypeMap = properties.reduce((acc, prop) => {
              if (!acc[prop.propertyType]) {
                acc[prop.propertyType] = [];
              }
              acc[prop.propertyType].push(prop.id);
              return acc;
            }, {});
            
            // For each property type, count messages
            const messagesByType = [];
            for (const [type, ids] of Object.entries(propertyTypeMap)) {
              const count = await tx.message.count({
                where: {
                  propertyId: { in: ids }
                }
              });
              
              messagesByType.push({
                propertyType: type,
                count
              });
            }
            
            return messagesByType;
          }),
          
          // Recent messages
          prisma.$transaction(async (tx) => {
            // First get all properties that belong to this user
            const userProperties = await tx.property.findMany({
              where: { userId: parseInt(userId) },
              select: { id: true }
            });
            
            // Extract property IDs
            const propertyIds = userProperties.map(prop => prop.id);
            
            // Get recent messages
            return tx.message.findMany({
              where: {
                propertyId: { in: propertyIds }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5,
              include: {
                property: {
                  select: {
                    projectName: true
                  }
                }
              }
            });
          })
        ]);
        
        totalProperties = userPropertiesCount;
        
        // Add property type names to the grouped data
        const propertiesByTypeWithNames = await Promise.all(
          userPropertiesByType.map(async (item) => {
            const propertyType = await prisma.typeProperty.findUnique({
              where: { id: item.propertyTypeId },
              select: { name: true }
            });
            return {
              propertyTypeId: item.propertyTypeId,
              propertyType: item.propertyTypeId, // Keep for backward compatibility
              propertyTypeName: propertyType?.name || 'Unknown',
              count: item._count.propertyTypeId
            };
          })
        );
        
        propertiesByType = propertiesByTypeWithNames;
        totalMessages = userMessages;
        messagesByStatus = userMessagesByStatus || [];
        messagesByType = userMessagesByType || [];
        recentMessages = userRecentMessages;
        
        // Count new messages
        newMessages = messagesByStatus.find(item => item.status === 'NEW')?.count || 0;
      }

      return res.status(200).json({
        success: true,
        data: {
          totalProperties,
          totalMessages,
          newMessages,
          propertiesByType,
          messagesByType,
          messagesByStatus,
          recentMessages
        }
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async getUserDashboardStats(req, res) {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user?.userId;
      const requestingUserRole = req.user?.role;

      // Security check: Users can only access their own data unless they are admin
      if (requestingUserRole !== 'ADMIN' && parseInt(requestingUserId) !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own dashboard data.'
        });
      }

      // Get user-specific dashboard stats
      const [userPropertiesCount, userPropertiesByType, userMessages, userMessagesByStatus, userMessagesByType, userRecentMessages] = await Promise.all([
        // Total properties by this user
        prisma.property.count({
          where: { userId: parseInt(userId) }
        }),
        
        // Properties by type for this user (simple groupBy)
        prisma.property.groupBy({
          by: ['propertyTypeId'],
          where: { userId: parseInt(userId) },
          _count: {
            propertyTypeId: true
          }
        }),
        
        // Messages for user's properties
        prisma.$transaction(async (tx) => {
          // First get all properties that belong to this user
          const userProperties = await tx.property.findMany({
            where: { userId: parseInt(userId) },
            select: { id: true },
          });
          
          // Extract property IDs
          const propertyIds = userProperties.map(prop => prop.id);
          
          if (propertyIds.length === 0) {
            return 0;
          }
          
          // Count total messages for these properties
          return tx.message.count({
            where: {
              propertyId: {
                in: propertyIds
              }
            }
          });
        }),
        
        // Messages by status for user's properties
        prisma.$transaction(async (tx) => {
          // First get all properties that belong to this user
          const userProperties = await tx.property.findMany({
            where: { userId: parseInt(userId) },
            select: { id: true },
          });
          
          // Extract property IDs
          const propertyIds = userProperties.map(prop => prop.id);
          
          if (propertyIds.length === 0) {
            return [];
          }
          
          // Group messages by status for these properties
          return tx.message.groupBy({
            by: ['status'],
            where: {
              propertyId: {
                in: propertyIds
              }
            },
            _count: {
              status: true
            }
          });
        }),
        
        // Messages by type for user's properties
        prisma.$transaction(async (tx) => {
          // First get all properties that belong to this user
          const userProperties = await tx.property.findMany({
            where: { userId: parseInt(userId) },
            select: { id: true },
          });
          
          // Extract property IDs
          const propertyIds = userProperties.map(prop => prop.id);
          
          if (propertyIds.length === 0) {
            return [];
          }
          
          // Group messages by property type for these properties
          return tx.message.groupBy({
            by: ['propertyId'],
            where: {
              propertyId: {
                in: propertyIds
              }
            },
            _count: {
              propertyId: true
            }
          });
        }),
        
        // Recent messages for user's properties
        prisma.$transaction(async (tx) => {
          // First get all properties that belong to this user
          const userProperties = await tx.property.findMany({
            where: { userId: parseInt(userId) },
            select: { id: true },
          });
          
          // Extract property IDs
          const propertyIds = userProperties.map(prop => prop.id);
          
          if (propertyIds.length === 0) {
            return [];
          }
          
          // Get recent messages for these properties
          return tx.message.findMany({
            where: {
              propertyId: {
                in: propertyIds
              }
            },
            include: {
              property: {
                select: {
                  projectName: true,
                  id: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          });
        })
      ]);

      // Calculate property views (simplified - you may need to adjust based on your views tracking)
      const propertiesViews = userPropertiesCount * 10; // Placeholder calculation
      
      // Count new messages
      const newMessages = userMessagesByStatus.find(status => status.status === 'NEW')?._count?.status || 0;

      // Add property type names to the grouped data
      const propertiesByTypeWithNames = await Promise.all(
        userPropertiesByType.map(async (item) => {
          const propertyType = await prisma.typeProperty.findUnique({
            where: { id: item.propertyTypeId },
            select: { name: true }
          });
          return {
            propertyTypeId: item.propertyTypeId,
            propertyType: item.propertyTypeId, // Keep for backward compatibility
            propertyTypeName: propertyType?.name || 'Unknown',
            count: item._count.propertyTypeId
          };
        })
      );

      return res.json({
        success: true,
        data: {
          totalProperties: userPropertiesCount,
          propertiesViews,
          totalMessages: userMessages,
          newMessages,
          propertiesByType: propertiesByTypeWithNames,
          messagesByType: userMessagesByType,
          messagesByStatus: userMessagesByStatus,
          recentMessages: userRecentMessages
        }
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

module.exports = new DashboardController();
