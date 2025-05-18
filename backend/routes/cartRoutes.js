import { Router } from 'express';
const router = Router();
import { protect, verifiedOnly } from '../middleware/userMiddleware';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController';

// Cart routes
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeCartItem);
router.delete('/', protect, clearCart);

export default router;