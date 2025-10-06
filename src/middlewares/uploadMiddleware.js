const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('./errorHandler');

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get property ID from route params or use 'temp' for new properties
    const propertyId = req.params.id || 'temp';

    let uploadDir;

    // Determine upload directory based on field name
    if (file.fieldname === 'floorPlanImages') {
      uploadDir = path.join(__dirname, '../../public/images/properties', propertyId.toString(), 'floor-plans');
    } else if (file.fieldname === 'unitPlanImages') {
      uploadDir = path.join(__dirname, '../../public/images/properties', propertyId.toString(), 'unit-plans');
    } else {
      // Default for main property images
      uploadDir = path.join(__dirname, '../../public/images/properties', propertyId.toString());
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Generate truly unique name with timestamp, random number and original filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9).toString().padStart(9, '0');

    // Include part of original filename (sanitized) for better readability
    let origNameSanitized = file.originalname
        .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
        .substring(0, 8);              // Take first 8 chars

    if (!origNameSanitized) {
      origNameSanitized = 'file';    // Fallback if no valid chars
    }

    // Get file extension
    const ext = path.extname(file.originalname);

    // Final filename: timestamp-random-origname-date.ext
    cb(null, `${timestamp}-${random}-${origNameSanitized}-${dateStr}${ext}`);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 80 // Max 80 files per request (50 + 15 + 15)
  }
});

// Middleware for handling property images upload
const uploadFields = upload.fields([
  { name: 'images', maxCount: 50 },
  { name: 'floorPlanImages', maxCount: 15 },
  { name: 'unitPlanImages', maxCount: 15 }
]);

// Middleware for handling form data with images
const handlePropertyFormData = (req, res, next) => {
  uploadFields(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_FIELD_COUNT') {
        return res.status(400).json({
          status: 'error',
          message: 'จำนวนรูปภาพเกิน 50 รูป กรุณาเลือกรูปภาพไม่เกิน 50 รูป',
          error: 'IMAGE_LIMIT_EXCEEDED'
        });
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      // An unknown error occurred
      return next(err);
    }

    // Process property images
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log(`Found ${req.files.images.length} uploaded images:`, req.files.images.map(f => f.filename));

      // Create image data array
      const images = req.files.images.map((file, index) => {
        return {
          url: `/images/properties/${req.params.id || 'temp'}/${file.filename}`,
          isFeatured: index === 0, // First image is featured
          sortOrder: index
        };
      });

      console.log('Created image data:', JSON.stringify(images, null, 2));

      // Add images to request body
      req.body.images = images;
    }

    // Process floor plan images
    if (req.files && req.files.floorPlanImages && req.files.floorPlanImages.length > 0) {
      // Create floor plan data array
      const floorPlans = req.files.floorPlanImages.map((file, index) => {
        return {
          url: `/images/properties/${req.params.id || 'temp'}/floor-plans/${file.filename}`,
          title: `Floor Plan ${index + 1}`,
          sortOrder: index
        };
      });

      // Add floor plans to request body
      req.body.floorPlans = floorPlans;
    }

    // Process unit plan images
    if (req.files && req.files.unitPlanImages && req.files.unitPlanImages.length > 0) {
      // Create unit plan data array
      const unitPlans = req.files.unitPlanImages.map((file, index) => {
        return {
          url: `/images/properties/${req.params.id || 'temp'}/unit-plans/${file.filename}`,
          title: `Unit Plan ${index + 1}`,
          sortOrder: index
        };
      });

      // Add unit plans to request body
      req.body.unitPlans = unitPlans;
    }

    // Continue with the next middleware
    next();
  });
};

// Single image upload for updating specific images
const uploadSingleImage = upload.single('image');

// Middleware for handling single image upload
const handleSingleImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    if (req.file) {
      req.body.imageUrl = `/images/properties/${req.params.id || 'temp'}/${req.file.filename}`;
    }

    next();
  });
};

// Blog image upload configuration
const blogImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../public/images/blogs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Generate truly unique name with timestamp, random number and original filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9).toString().padStart(9, '0');

    // Include part of original filename (sanitized) for better readability
    let origNameSanitized = file.originalname
        .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
        .substring(0, 8);              // Take first 8 chars

    if (!origNameSanitized) {
      origNameSanitized = 'file';    // Fallback if no valid chars
    }

    // Get file extension
    const ext = path.extname(file.originalname);

    // Final filename: timestamp-random-origname-date.ext
    cb(null, `${timestamp}-${random}-${origNameSanitized}-${dateStr}${ext}`);
  }
});

// Create multer upload instance for blog images
const uploadBlogImage = multer({
  storage: blogImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('featuredImage');

/**
 * Middleware for handling blog image upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleBlogImageUpload = (req, res, next) => {
  uploadBlogImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error
      return next(new ApiError(400, `Image upload error: ${err.message}`));
    } else if (err) {
      // Other error
      return next(err);
    }

    // If file was uploaded, add the URL to the request body
    if (req.file) {
      // Create URL for the uploaded image
      const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/images/blogs/${req.file.filename}`;

      // Add image URL to request body
      req.body.featuredImage = imageUrl;
    }

    next();
  });
};

module.exports = {
  uploadFields,
  handlePropertyFormData,
  uploadSingleImage,
  handleSingleImageUpload,
  handleBlogImageUpload
};
