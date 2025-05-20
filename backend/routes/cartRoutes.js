import { Router } from 'express';
const router = Router();
import { protect, verifiedOnly } from '../middleware/userMiddleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

// Cart routes
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeCartItem);
router.delete('/', protect, clearCart);

export default router;