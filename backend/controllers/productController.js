import Product from '../models/Product.js';
import { normalizeProduct } from '../utils/normalizer.js';
import { getProducts as getGlowroadProducts } from '../services/glowroadService.js';
import { getProducts as getSpocketProducts } from '../services/spocketService.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export async function getAllProducts(req, res) {
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

    if (inStock === 'true') {
      query.inventory = { $gt: 0 };
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

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
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export async function getProductById(req, res) {
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
}

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
export async function searchProducts(req, res) {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const searchQuery = {
      isAvailable: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(searchQuery)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
}

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort, order = 'desc' } = req.query;

    const query = { category, isAvailable: true };

    let sortOptions = { createdAt: -1 };
    if (sort === 'price') sortOptions = { price: order === 'asc' ? 1 : -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

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
}

// @desc    Get products by origin
// @route   GET /api/products/origin/:origin
// @access  Public
export async function getProductsByOrigin(req, res) {
  try {
    const { origin } = req.params;
    const { page = 1, limit = 20, sort, order = 'desc' } = req.query;

    const query = { origin, isAvailable: true };

    let sortOptions = { createdAt: -1 };
    if (sort === 'price') sortOptions = { price: order === 'asc' ? 1 : -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

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
}

// @desc    Refresh products from dropshipping APIs
// @route   GET /api/products/refresh
// @access  Private/Admin
export async function refreshProducts(req, res) {
  try {
    const glowroadProducts = await getGlowroadProducts();
    const spocketProducts = await getSpocketProducts();

    const normalizedGlowroad = glowroadProducts.map(product =>
      normalizeProduct(product, 'GlowRoad', 'India')
    );

    const normalizedSpocket = spocketProducts.map(product =>
      normalizeProduct(product, 'Spocket', 'Global')
    );

    const allProducts = [...normalizedGlowroad, ...normalizedSpocket];

    let updatedCount = 0;
    let newCount = 0;

    for (const product of allProducts) {
      const existing = await Product.findOne({ id: product.id });

      if (existing) {
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
}
