const express = require('express');
const router = express.Router();
const iconController = require('../controllers/iconController');


// Get all icons
router.get('/', iconController.getAllIcons);

// Get icons by prefix (e.g., facility, property-type)
router.get('/prefix/:prefix', iconController.getIconsByPrefix);



// Get specific icon by id
router.get('/:id', iconController.getIconById);

module.exports = router;
