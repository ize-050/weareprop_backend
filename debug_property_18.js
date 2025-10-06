const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkProperty18() {
  try {
    console.log('🔍 Checking Property ID 18...\n');

    // Try to find property with ID 18 without any filters first
    const propertyRaw = await prisma.property.findUnique({
      where: { id: 18 },
      include: {
        images: true,
        listings: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        propertyType: true,
      }
    });

    if (!propertyRaw) {
      console.log('❌ Property ID 18 does NOT exist in the database');
      
      // Check what properties do exist around ID 18
      console.log('\n📋 Checking properties with IDs around 18...');
      const nearbyProperties = await prisma.property.findMany({
        where: {
          id: {
            gte: 15,
            lte: 20
          }
        },
        select: {
          id: true,
          title: true,
          deletedAt: true,
          isPublished: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          id: 'asc'
        }
      });

      if (nearbyProperties.length > 0) {
        console.log('Found these properties with IDs 15-20:');
        nearbyProperties.forEach(prop => {
          console.log(`  ID ${prop.id}: "${prop.title}" - Published: ${prop.isPublished}, Status: ${prop.status}, Deleted: ${prop.deletedAt ? 'YES' : 'NO'}`);
        });
      } else {
        console.log('No properties found with IDs between 15-20');
      }

      return;
    }

    console.log('✅ Property ID 18 EXISTS!\n');
    
    // Display basic information
    console.log('📄 Basic Information:');
    console.log(`  Title: ${propertyRaw.title}`);
    console.log(`  Project Name: ${propertyRaw.projectName}`);
    console.log(`  Property Code: ${propertyRaw.propertyCode}`);
    console.log(`  Reference ID: ${propertyRaw.referenceId}`);
    
    // Display status information
    console.log('\n🔍 Status Information:');
    console.log(`  Published (isPublished): ${propertyRaw.isPublished}`);
    console.log(`  Status: ${propertyRaw.status}`);
    console.log(`  Featured (isFeatured): ${propertyRaw.isFeatured}`);
    console.log(`  Deleted At: ${propertyRaw.deletedAt ? propertyRaw.deletedAt : 'NOT DELETED'}`);
    
    // Display timestamps
    console.log('\n📅 Timestamps:');
    console.log(`  Created At: ${propertyRaw.createdAt}`);
    console.log(`  Updated At: ${propertyRaw.updatedAt}`);
    
    // Display owner information
    console.log('\n👤 Owner Information:');
    console.log(`  User ID: ${propertyRaw.userId}`);
    if (propertyRaw.user) {
      console.log(`  Owner Name: ${propertyRaw.user.name || 'N/A'}`);
      console.log(`  Owner Email: ${propertyRaw.user.email}`);
    }
    
    // Display property type
    console.log('\n🏠 Property Type:');
    if (propertyRaw.propertyType) {
      console.log(`  Type ID: ${propertyRaw.propertyTypeId}`);
      console.log(`  Type Name: ${propertyRaw.propertyType.name}`);
      console.log(`  Type Name (EN): ${propertyRaw.propertyType.nameEn}`);
    } else {
      console.log(`  Type ID: ${propertyRaw.propertyTypeId} (Type details not found)`);
    }
    
    // Display images information
    console.log('\n🖼️  Images:');
    if (propertyRaw.images && propertyRaw.images.length > 0) {
      console.log(`  Total Images: ${propertyRaw.images.length}`);
      const featuredImage = propertyRaw.images.find(img => img.isFeatured);
      console.log(`  Featured Image: ${featuredImage ? featuredImage.url : 'None'}`);
    } else {
      console.log('  No images found');
    }
    
    // Display listings information
    console.log('\n💰 Listings:');
    if (propertyRaw.listings && propertyRaw.listings.length > 0) {
      console.log(`  Total Listings: ${propertyRaw.listings.length}`);
      propertyRaw.listings.forEach((listing, index) => {
        console.log(`  Listing ${index + 1}:`);
        console.log(`    Type: ${listing.listingType}`);
        console.log(`    Price: ${listing.price} ${listing.currency}`);
        console.log(`    Status: ${listing.status}`);
      });
    } else {
      console.log('  No listings found');
    }

    // Summary for quick reference
    console.log('\n📊 SUMMARY:');
    console.log(`  Property ID 18: ${propertyRaw.deletedAt ? '🗑️  SOFT DELETED' : '✅ ACTIVE'}`);
    console.log(`  Published Status: ${propertyRaw.isPublished ? '✅ PUBLISHED' : '❌ UNPUBLISHED'}`);
    console.log(`  General Status: ${propertyRaw.status}`);
    
    // Check if property would be visible in public queries
    const isVisibleInPublicQueries = !propertyRaw.deletedAt && propertyRaw.isPublished;
    console.log(`  Visible in Public Queries: ${isVisibleInPublicQueries ? '✅ YES' : '❌ NO'}`);
    
    if (!isVisibleInPublicQueries) {
      console.log('\n⚠️  VISIBILITY ISSUES:');
      if (propertyRaw.deletedAt) {
        console.log('  - Property is SOFT DELETED');
      }
      if (!propertyRaw.isPublished) {
        console.log('  - Property is NOT PUBLISHED');
      }
    }

  } catch (error) {
    console.error('❌ Error checking property:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
checkProperty18();