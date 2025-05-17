const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  loginAdmin, 
  registerAdmin, 
  getAdminProfile,
  generateLoginOTP,
  verifyLoginOTP
} = require('../controllers/authController');
const {
  getDashboardStats,
  getTopSellingProducts,
  getTrendingProducts,
  getAllProductsWithSales,
  updateProduct,
  deleteProduct,
  exportSalesData,
  getSalesByRegion,
  getSalesByCategory,
  getCustomerDemographics,
  getSalesForecast,
  getProductPerformance,
  getInventoryAnalysis,
  getCustomerCohortAnalysis
} = require('../controllers/adminController');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');

// Auth routes
router.post('/login', loginAdmin);
router.post('/login/otp/generate', generateLoginOTP);
router.post('/login/otp/verify', verifyLoginOTP);
router.post('/register', protect, authorize('super-admin'), registerAdmin);
router.get('/me', protect, getAdminProfile);

// Dashboard stats
router.get('/stats', protect, getDashboardStats);

// Products routes
router.get('/products', protect, getAllProductsWithSales);
router.get('/products/top-selling', protect, getTopSellingProducts);
router.get('/products/trending', protect, getTrendingProducts);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);

// Orders routes
router.get('/orders', protect, getAllOrders);
router.get('/orders/stats', protect, getOrderStats);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id', protect, updateOrderStatus);
router.delete('/orders/:id', protect, deleteOrder);

// Analytics routes
router.get('/analytics/sales-by-region', protect, getSalesByRegion);
router.get('/analytics/sales-by-category', protect, getSalesByCategory);
router.get('/analytics/customer-demographics', protect, getCustomerDemographics);
router.get('/analytics/sales-forecast', protect, getSalesForecast);
router.get('/analytics/product-performance', protect, getProductPerformance);
router.get('/analytics/inventory', protect, getInventoryAnalysis);
router.get('/analytics/customer-cohorts', protect, getCustomerCohortAnalysis);

// Export data
router.get('/export/sales', protect, exportSalesData);

module.exports = router;