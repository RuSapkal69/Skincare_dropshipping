import { Router } from 'express';
const router = Router();
import { protect, verifiedOnly } from '../middleware/userMiddleware.js';
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, getUserProfile, updateUserProfile, addAddress, updateAddress, deleteAddress, getUserOrders, getUserOrderDetails, addToWishlist, removeFromWishlist, getWishlist } from '../controllers/userController.js';

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Address routes
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

// Order routes
router.get('/orders', protect, verifiedOnly, getUserOrders);
router.get('/orders/:id', protect, verifiedOnly, getUserOrderDetails);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

export default router;