import { Router } from 'express';
const router = Router();
import { protect } from '../middleware/authMiddleware.js';
import { getAllProducts, getProductById, searchProducts, getProductsByCategory, getProductsByOrigin, refreshProducts } from '../controllers/productController.js';

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

export default router;