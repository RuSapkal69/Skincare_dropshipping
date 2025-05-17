const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getAllProducts, 
  getProductById, 
  searchProducts,
  getProductsByCategory,
  getProductsByOrigin,
  refreshProducts
} = require('../controllers/productController');

// Get all products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Search products
router.get('/search/:query', searchProducts);

// Get products by category
router.get('/category/:category', getProductsByCategory);

// Get products by origin
router.get('/origin/:origin', getProductsByOrigin);

// Refresh products from dropshipping APIs (admin only)
router.get('/refresh', protect, refreshProducts);

module.exports = router;