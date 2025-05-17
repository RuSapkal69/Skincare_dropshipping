const Product = require('../models/Product');
const { normalizeProduct } = require('../utils/normalizer');
const glowroadService = require('../services/glowroadService');
const spocketService = require('../services/spocketService');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      category,
      origin,
      minPrice,
      maxPrice,
      inStock = 'true'
    } = req.query;
    
    // Build query
    const query = { isAvailable: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (origin) query.origin = origin;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') query.inventory = { $gt: 0 };
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Build search query
    const searchQuery = {
      isAvailable: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(searchQuery)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort, order = 'desc' } = req.query;
    
    // Build query
    const query = { category, isAvailable: true };
    
    // Build sort options
    let sortOptions = { createdAt: -1 };
    if (sort === 'price' && order === 'asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price' && order === 'desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get products by origin
// @route   GET /api/products/origin/:origin
// @access  Public
exports.getProductsByOrigin = async (req, res) => {
  try {
    const { origin } = req.params;
    const { page = 1, limit = 20, sort, order = 'desc' } = req.query;
    
    // Build query
    const query = { origin, isAvailable: true };
    
    // Build sort options
    let sortOptions = { createdAt: -1 };
    if (sort === 'price' && order === 'asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price' && order === 'desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Refresh products from dropshipping APIs
// @route   GET /api/products/refresh
// @access  Private/Admin
exports.refreshProducts = async (req, res) => {
  try {
    // Fetch products from GlowRoad (Indian products)
    const glowroadProducts = await glowroadService.getProducts();
    
    // Fetch products from Spocket (Global products)
    const spocketProducts = await spocketService.getProducts();
    
    // Normalize products
    const normalizedGlowroadProducts = glowroadProducts.map(product => 
      normalizeProduct(product, 'GlowRoad', 'India')
    );
    
    const normalizedSpocketProducts = spocketProducts.map(product => 
      normalizeProduct(product, 'Spocket', 'Global')
    );
    
    // Combine products
    const allProducts = [...normalizedGlowroadProducts, ...normalizedSpocketProducts];
    
    // Update or insert products in database
    let updatedCount = 0;
    let newCount = 0;
    
    for (const product of allProducts) {
      const existingProduct = await Product.findOne({ id: product.id });
      
      if (existingProduct) {
        await Product.findOneAndUpdate(
          { id: product.id },
          { ...product, updatedAt: new Date() }
        );
        updatedCount++;
      } else {
        await Product.create(product);
        newCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Products refreshed successfully',
      count: allProducts.length,
      updated: updatedCount,
      new: newCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};