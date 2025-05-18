import { aggregate, countDocuments, find } from '../models/Order';
import { find as _find, aggregate as _aggregate, countDocuments as _countDocuments, findByIdAndUpdate, findByIdAndDelete } from '../models/Product';
import mongoose from 'mongoose';
import moment from 'moment';
import { createObjectCsvWriter } from 'csv-writer';
import { existsSync, mkdirSync, unlink } from 'fs';
import { join } from 'path';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export async function getDashboardStats(req, res) {
  try {
    const { 
      startDate, 
      endDate, 
      category, 
      origin, 
      country, 
      compareWithPrevious = 'false' 
    } = req.query;
    
    // Build date filter
    let dateFilter = {};
    let previousPeriodFilter = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };
      
      // Calculate previous period for comparison
      if (compareWithPrevious === 'true') {
        const periodDuration = end.getTime() - start.getTime();
        const previousStart = new Date(start.getTime() - periodDuration);
        const previousEnd = new Date(end.getTime() - periodDuration);
        
        previousPeriodFilter = {
          createdAt: {
            $gte: previousStart,
            $lte: previousEnd
          }
        };
      }
    }
    
    // Build product filter
    const productFilter = {};
    if (category) productFilter.category = category;
    if (origin) productFilter.origin = origin;
    
    // Build order filter
    const orderFilter = { status: 'completed', ...dateFilter };
    if (country) orderFilter['shippingAddress.country'] = country;
    
    // Previous period filter
    const previousOrderFilter = { status: 'completed', ...previousPeriodFilter };
    if (country) previousOrderFilter['shippingAddress.country'] = country;
    
    // Get total earnings for current period
    const totalEarnings = await aggregate([
      { $match: orderFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Get total earnings for previous period if requested
    let previousTotalEarnings = [];
    if (compareWithPrevious === 'true') {
      previousTotalEarnings = await aggregate([
        { $match: previousOrderFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
    }
    
    // Get monthly earnings for the selected period
    let monthlyEarnings = [];
    if (startDate && endDate) {
      monthlyEarnings = await aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
    } else {
      // Default to current year if no date range specified
      const currentYear = new Date().getFullYear();
      monthlyEarnings = await aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }
    
    // Get daily earnings for the selected period (if period is less than 90 days)
    let dailyEarnings = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (dayDiff <= 90) {
        dailyEarnings = await aggregate([
          { $match: orderFilter },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              total: { $sum: '$totalAmount' },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
      }
    }
    
    // Get products filtered by category and origin if specified
    const productsQuery = _find(productFilter);
    const totalProducts = await productsQuery.countDocuments();
    
    // Get products by origin (filtered by category if specified)
    const productsByOrigin = await _aggregate([
      { $match: productFilter },
      { $group: { _id: '$origin', count: { $sum: 1 } } }
    ]);
    
    // Get products by category (filtered by origin if specified)
    const productsByCategory = await _aggregate([
      { $match: productFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get total orders count (filtered)
    const totalOrders = await countDocuments(orderFilter);
    
    // Get orders by status (filtered)
    const ordersByStatus = await aggregate([
      { $match: { ...dateFilter } }, // Don't filter by status here
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get recent orders (filtered)
    const recentOrders = await find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('products.product', 'title price image');
    
    // Get top selling products (filtered)
    const topSellingProducts = await aggregate([
      { $match: orderFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: productFilter.category ? { 'productDetails.category': productFilter.category } : {} },
      { $match: productFilter.origin ? { 'productDetails.origin': productFilter.origin } : {} },
      {
        $group: {
          _id: '$products.product',
          title: { $first: '$productDetails.title' },
          image: { $first: '$productDetails.image' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    
    // Calculate growth rates if comparing with previous period
    let growth = null;
    if (compareWithPrevious === 'true') {
      const currentTotal = totalEarnings.length > 0 ? totalEarnings[0].total : 0;
      const previousTotal = previousTotalEarnings.length > 0 ? previousTotalEarnings[0].total : 0;
      
      growth = {
        revenue: {
          current: currentTotal,
          previous: previousTotal,
          percentChange: previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null
        }
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        monthlyEarnings,
        dailyEarnings,
        totalProducts,
        productsByOrigin,
        productsByCategory,
        totalOrders,
        ordersByStatus,
        recentOrders,
        topSellingProducts,
        growth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get top selling products
// @route   GET /api/admin/products/top-selling
// @access  Private/Admin
export async function getTopSellingProducts(req, res) {
  try {
    const { startDate, endDate, limit = 10, category, origin } = req.query;
    
    // Build date filter
    let dateFilter = { status: 'completed' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Build product filter
    const productFilter = {};
    if (category) productFilter['productDetails.category'] = category;
    if (origin) productFilter['productDetails.origin'] = origin;
    
    const topSellingProducts = await aggregate([
      { $match: dateFilter },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: productFilter },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          title: '$productDetails.title',
          price: '$productDetails.price',
          image: '$productDetails.image',
          origin: '$productDetails.origin',
          category: '$productDetails.category',
          brand: '$productDetails.brand'
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      count: topSellingProducts.length,
      data: topSellingProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get trending products (based on recent orders)
// @route   GET /api/admin/products/trending
// @access  Private/Admin
export async function getTrendingProducts(req, res) {
  try {
    const { days = 30, limit = 10, category, origin } = req.query;
    
    // Get orders from the last X days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Build product filter
    const productFilter = {};
    if (category) productFilter['productDetails.category'] = category;
    if (origin) productFilter['productDetails.origin'] = origin;
    
    const trendingProducts = await aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          recentOrders: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      // Calculate a trending score (more weight to recent orders)
      {
        $addFields: {
          trendingScore: { 
            $multiply: [
              '$totalSold', 
              { $pow: [1.5, '$recentOrders'] } // Exponential weight to recent orders
            ] 
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: productFilter },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          recentOrders: 1,
          totalRevenue: 1,
          trendingScore: 1,
          title: '$productDetails.title',
          price: '$productDetails.price',
          image: '$productDetails.image',
          origin: '$productDetails.origin',
          category: '$productDetails.category',
          brand: '$productDetails.brand'
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      count: trendingProducts.length,
      data: trendingProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get all products with sales data
// @route   GET /api/admin/products
// @access  Private/Admin
export async function getAllProductsWithSales(req, res) {
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
      inStock = 'all'
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (origin) filter.origin = origin;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') filter.inventory = { $gt: 0 };
    if (inStock === 'false') filter.inventory = 0;
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await _find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await _countDocuments(filter);
    
    // Get sales data for each product
    const productIds = products.map(product => product._id);
    
    const salesData = await aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$products' },
      {
        $match: {
          'products.product': { $in: productIds }
        }
      },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          lastSold: { $max: '$createdAt' }
        }
      }
    ]);
    
    // Map sales data to products
    const productsWithSales = products.map(product => {
      const sales = salesData.find(item => item._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        sales: sales ? sales.totalSold : 0,
        revenue: sales ? sales.revenue : 0,
        lastSold: sales ? sales.lastSold : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: productsWithSales.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: productsWithSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Update product availability
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

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

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get sales by region
// @route   GET /api/admin/analytics/sales-by-region
// @access  Private/Admin
export async function getSalesByRegion(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = { status: 'completed' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get sales by country
    const salesByCountry = await aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$shippingAddress.country',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    // Get sales by state (for top countries)
    const topCountries = salesByCountry.slice(0, 5).map(item => item._id);
    
    const salesByState = await aggregate([
      { 
        $match: { 
          ...dateFilter,
          'shippingAddress.country': { $in: topCountries }
        } 
      },
      {
        $group: {
          _id: {
            country: '$shippingAddress.country',
            state: '$shippingAddress.state'
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    // Get sales by city (for top states)
    const topStatesByCountry = {};
    salesByState.forEach(item => {
      if (!topStatesByCountry[item._id.country]) {
        topStatesByCountry[item._id.country] = [];
      }
      if (topStatesByCountry[item._id.country].length < 5) {
        topStatesByCountry[item._id.country].push(item._id.state);
      }
    });
    
    const salesByCity = await aggregate([
      {
        $match: {
          ...dateFilter,
          $or: Object.entries(topStatesByCountry).map(([country, states]) => ({
            'shippingAddress.country': country,
            'shippingAddress.state': { $in: states }
          }))
        }
      },
      {
        $group: {
          _id: {
            country: '$shippingAddress.country',
            state: '$shippingAddress.state',
            city: '$shippingAddress.city'
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        salesByCountry,
        salesByState,
        salesByCity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get sales by category
// @route   GET /api/admin/analytics/sales-by-category
// @access  Private/Admin
export async function getSalesByCategory(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = { status: 'completed' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get sales by category
    const salesByCategory = await aggregate([
      { $match: dateFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          totalQuantity: { $sum: '$products.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    // Get sales by subcategory for top categories
    const topCategories = salesByCategory.slice(0, 5).map(item => item._id);
    
    const salesBySubcategory = await aggregate([
      { $match: dateFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: { 'productDetails.category': { $in: topCategories } } },
      {
        $group: {
          _id: {
            category: '$productDetails.category',
            subcategory: '$productDetails.subcategory'
          },
          totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          totalQuantity: { $sum: '$products.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        salesByCategory,
        salesBySubcategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get customer demographics
// @route   GET /api/admin/analytics/customer-demographics
// @access  Private/Admin
export async function getCustomerDemographics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get customers by age group
    const customersByAgeGroup = await aggregate([
      { $match: { ...dateFilter, 'customerDemographics.ageGroup': { $exists: true } } },
      {
        $group: {
          _id: '$customerDemographics.ageGroup',
          customerCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get customers by gender
    const customersByGender = await aggregate([
      { $match: { ...dateFilter, 'customerDemographics.gender': { $exists: true } } },
      {
        $group: {
          _id: '$customerDemographics.gender',
          customerCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Get customers by device type
    const customersByDevice = await aggregate([
      { $match: { ...dateFilter, 'deviceInfo.type': { $exists: true } } },
      {
        $group: {
          _id: '$deviceInfo.type',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Get customers by referral source
    const customersByReferral = await aggregate([
      { $match: { ...dateFilter, 'referralSource': { $exists: true } } },
      {
        $group: {
          _id: '$referralSource',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        customersByAgeGroup,
        customersByGender,
        customersByDevice,
        customersByReferral
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get sales forecast
// @route   GET /api/admin/analytics/sales-forecast
// @access  Private/Admin
export async function getSalesForecast(req, res) {
  try {
    // Get monthly sales for the last 12 months
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    
    const monthlySales = await aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: lastYear }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Simple moving average forecast for the next 3 months
    const forecast = [];
    
    if (monthlySales.length >= 3) {
      // Get the last 3 months of data
      const last3Months = monthlySales.slice(-3);
      
      // Calculate average monthly sales
      const avgSales = last3Months.reduce((sum, month) => sum + month.totalSales, 0) / 3;
      const avgOrders = last3Months.reduce((sum, month) => sum + month.orderCount, 0) / 3;
      
      // Calculate growth rate
      const growthRate = last3Months.length >= 2 ? 
        (last3Months[2].totalSales - last3Months[0].totalSales) / last3Months[0].totalSales : 0;
      
      // Generate forecast for next 3 months
      const lastMonth = last3Months[2]._id;
      
      for (let i = 1; i <= 3; i++) {
        let forecastMonth = lastMonth.month + i;
        let forecastYear = lastMonth.year;
        
        if (forecastMonth > 12) {
          forecastMonth -= 12;
          forecastYear += 1;
        }
        
        // Apply growth rate to forecast
        const forecastSales = avgSales * (1 + growthRate * i);
        const forecastOrders = avgOrders * (1 + growthRate * i);
        
        forecast.push({
          _id: {
            year: forecastYear,
            month: forecastMonth
          },
          totalSales: forecastSales,
          orderCount: forecastOrders,
          isForecast: true
        });
      }
    }
    
    // Combine historical data with forecast
    const salesWithForecast = [...monthlySales.map(m => ({ ...m, isForecast: false })), ...forecast];
    
    res.status(200).json({
      success: true,
      data: {
        salesWithForecast
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get product performance
// @route   GET /api/admin/analytics/product-performance
// @access  Private/Admin
export async function getProductPerformance(req, res) {
  try {
    const { startDate, endDate, category, origin } = req.query;
    
    // Build date filter
    let dateFilter = { status: 'completed' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Build product filter
    const productFilter = {};
    if (category) productFilter['productDetails.category'] = category;
    if (origin) productFilter['productDetails.origin'] = origin;
    
    // Get product performance metrics
    const productPerformance = await aggregate([
      { $match: dateFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: productFilter },
      {
        $group: {
          _id: '$products.product',
          title: { $first: '$productDetails.title' },
          category: { $first: '$productDetails.category' },
          origin: { $first: '$productDetails.origin' },
          brand: { $first: '$productDetails.brand' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'currentProduct'
        }
      },
      { $unwind: '$currentProduct' },
      {
        $addFields: {
          inventory: '$currentProduct.inventory',
          price: '$currentProduct.price',
          isAvailable: '$currentProduct.isAvailable'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          origin: 1,
          brand: 1,
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: 1,
          inventory: 1,
          price: 1,
          isAvailable: 1,
          // Calculate performance metrics
          turnoverRate: { $divide: ['$totalSold', { $add: ['$inventory', '$totalSold'] }] },
          profitMargin: { 
            $multiply: [
              { $divide: [{ $subtract: ['$totalRevenue', { $multiply: ['$totalSold', { $multiply: ['$price', 0.7] }] }] }, '$totalRevenue'] },
              100
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: productPerformance.length,
      data: productPerformance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get inventory analysis
// @route   GET /api/admin/analytics/inventory
// @access  Private/Admin
export async function getInventoryAnalysis(req, res) {
  try {
    // Get all products with inventory
    const products = await _find().select('id title inventory category origin price');
    
    // Get sales velocity (average units sold per day) for each product
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesVelocity = await aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' }
        }
      }
    ]);
    
    // Calculate days of inventory remaining and restock recommendations
    const inventoryAnalysis = products.map(product => {
      const sales = salesVelocity.find(item => item._id.toString() === product._id.toString());
      const dailySales = sales ? sales.totalSold / 30 : 0;
      
      // Days of inventory remaining
      const daysRemaining = dailySales > 0 ? Math.round(product.inventory / dailySales) : null;
      
      // Restock recommendation
      let restockRecommendation = 'No action needed';
      let restockUrgency = 'low';
      
      if (daysRemaining !== null) {
        if (daysRemaining <= 7) {
          restockRecommendation = 'Urgent restock needed';
          restockUrgency = 'high';
        } else if (daysRemaining <= 14) {
          restockRecommendation = 'Restock soon';
          restockUrgency = 'medium';
        } else if (daysRemaining <= 30) {
          restockRecommendation = 'Consider restocking';
          restockUrgency = 'low';
        }
      } else if (product.inventory === 0) {
        restockRecommendation = 'Out of stock';
        restockUrgency = 'high';
      } else if (product.inventory < 5) {
        restockRecommendation = 'Low inventory';
        restockUrgency = 'medium';
      }
      
      // Recommended order quantity
      const recommendedOrderQty = dailySales > 0 ? Math.ceil(dailySales * 45) - product.inventory : 0;
      
      return {
        _id: product._id,
        title: product.title,
        category: product.category,
        origin: product.origin,
        currentInventory: product.inventory,
        dailySales: dailySales.toFixed(2),
        daysRemaining: daysRemaining,
        restockRecommendation,
        restockUrgency,
        recommendedOrderQty: recommendedOrderQty > 0 ? recommendedOrderQty : 0
      };
    });
    
    // Sort by urgency and days remaining
    inventoryAnalysis.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (urgencyOrder[a.restockUrgency] !== urgencyOrder[b.restockUrgency]) {
        return urgencyOrder[a.restockUrgency] - urgencyOrder[b.restockUrgency];
      }
      
      // If same urgency, sort by days remaining (null values at the end)
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    });
    
    // Summary statistics
    const outOfStock = inventoryAnalysis.filter(item => item.currentInventory === 0).length;
    const lowStock = inventoryAnalysis.filter(item => item.restockUrgency === 'high' && item.currentInventory > 0).length;
    const healthyStock = inventoryAnalysis.filter(item => item.restockUrgency === 'low').length;
    
    res.status(200).json({
      success: true,
      data: {
        inventoryAnalysis,
        summary: {
          totalProducts: products.length,
          outOfStock,
          lowStock,
          healthyStock
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get customer cohort analysis
// @route   GET /api/admin/analytics/customer-cohorts
// @access  Private/Admin
export async function getCustomerCohortAnalysis(req, res) {
  try {
    // Get all orders
    const orders = await find()
      .select('customerEmail totalAmount createdAt')
      .sort('createdAt');
    
    // Group customers by cohort (month of first purchase)
    const customerCohorts = {};
    const customerFirstPurchase = {};
    const customerPurchases = {};
    
    orders.forEach(order => {
      const { customerEmail, totalAmount, createdAt } = order;
      const orderDate = moment(createdAt);
      const cohortKey = orderDate.format('YYYY-MM');
      const monthsSinceStart = orderDate.diff(moment(orders[0].createdAt), 'months');
      
      // Track first purchase date for each customer
      if (!customerFirstPurchase[customerEmail]) {
        customerFirstPurchase[customerEmail] = {
          cohortKey,
          date: createdAt
        };
      }
      
      // Track all purchases for each customer
      if (!customerPurchases[customerEmail]) {
        customerPurchases[customerEmail] = [];
      }
      customerPurchases[customerEmail].push({
        amount: totalAmount,
        date: createdAt
      });
    });
    
    // Calculate retention and spending by cohort
    Object.entries(customerFirstPurchase).forEach(([email, { cohortKey }]) => {
      if (!customerCohorts[cohortKey]) {
        customerCohorts[cohortKey] = {
          totalCustomers: 0,
          totalRevenue: 0,
          retentionByMonth: {},
          spendingByMonth: {}
        };
      }
      
      // Increment customer count for this cohort
      customerCohorts[cohortKey].totalCustomers++;
      
      // Calculate retention and spending for each month after first purchase
      customerPurchases[email].forEach(purchase => {
        const purchaseDate = moment(purchase.date);
        const firstPurchaseDate = moment(customerFirstPurchase[email].date);
        const monthsAfterFirst = purchaseDate.diff(firstPurchaseDate, 'months');
        
        // Add to total revenue for the cohort
        customerCohorts[cohortKey].totalRevenue += purchase.amount;
        
        // Track retention by month
        if (!customerCohorts[cohortKey].retentionByMonth[monthsAfterFirst]) {
          customerCohorts[cohortKey].retentionByMonth[monthsAfterFirst] = 0;
        }
        customerCohorts[cohortKey].retentionByMonth[monthsAfterFirst]++;
        
        // Track spending by month
        if (!customerCohorts[cohortKey].spendingByMonth[monthsAfterFirst]) {
          customerCohorts[cohortKey].spendingByMonth[monthsAfterFirst] = 0;
        }
        customerCohorts[cohortKey].spendingByMonth[monthsAfterFirst] += purchase.amount;
      });
    });
    
    // Format data for response
    const cohortAnalysis = Object.entries(customerCohorts).map(([cohort, data]) => {
      // Calculate retention rates
      const retentionRates = {};
      Object.entries(data.retentionByMonth).forEach(([month, count]) => {
        retentionRates[month] = (count / data.totalCustomers) * 100;
      });
      
      // Calculate average spending
      const avgSpending = {};
      Object.entries(data.spendingByMonth).forEach(([month, amount]) => {
        const customersInMonth = data.retentionByMonth[month] || 0;
        avgSpending[month] = customersInMonth > 0 ? amount / customersInMonth : 0;
      });
      
      return {
        cohort,
        totalCustomers: data.totalCustomers,
        totalRevenue: data.totalRevenue,
        retentionRates,
        avgSpending,
        ltv: data.totalRevenue / data.totalCustomers
      };
    });
    
    // Sort by cohort date (newest first)
    cohortAnalysis.sort((a, b) => b.cohort.localeCompare(a.cohort));
    
    res.status(200).json({
      success: true,
      data: cohortAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Export sales data (CSV format)
// @route   GET /api/admin/export/sales
// @access  Private/Admin
export async function exportSalesData(req, res) {
  try {
    const { startDate, endDate, category, origin, country } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Build product filter for lookup
    const productFilter = {};
    if (category) productFilter['productDetails.category'] = category;
    if (origin) productFilter['productDetails.origin'] = origin;
    
    // Build order filter
    const orderFilter = { ...dateFilter };
    if (country) orderFilter['shippingAddress.country'] = country;
    
    // Get orders with product details
    const orders = await aggregate([
      { $match: orderFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $match: productFilter },
      {
        $project: {
          orderId: '$_id',
          customerName: 1,
          customerEmail: 1,
          orderDate: '$createdAt',
          productId: '$productDetails._id',
          productTitle: '$productDetails.title',
          productCategory: '$productDetails.category',
          productOrigin: '$productDetails.origin',
          quantity: '$products.quantity',
          price: '$products.price',
          total: { $multiply: ['$products.price', '$products.quantity'] },
          status: 1,
          paymentStatus: 1,
          shippingCountry: '$shippingAddress.country',
          shippingState: '$shippingAddress.state',
          shippingCity: '$shippingAddress.city'
        }
      }
    ]);
    
    // Create a temporary file for CSV
    const timestamp = Date.now();
    const tempFilePath = join(__dirname, `../temp/sales-export-${timestamp}.csv`);
    
    // Ensure temp directory exists
    if (!existsSync(join(__dirname, '../temp'))) {
      mkdirSync(join(__dirname, '../temp'));
    }
    
    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'orderId', title: 'Order ID' },
        { id: 'customerName', title: 'Customer Name' },
        { id: 'customerEmail', title: 'Customer Email' },
        { id: 'orderDate', title: 'Order Date' },
        { id: 'productId', title: 'Product ID' },
        { id: 'productTitle', title: 'Product Title' },
        { id: 'productCategory', title: 'Category' },
        { id: 'productOrigin', title: 'Origin' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'price', title: 'Price' },
        { id: 'total', title: 'Total' },
        { id: 'status', title: 'Order Status' },
        { id: 'paymentStatus', title: 'Payment Status' },
        { id: 'shippingCountry', title: 'Country' },
        { id: 'shippingState', title: 'State' },
        { id: 'shippingCity', title: 'City' }
      ]
    });
    
    // Format dates and IDs for CSV
    const formattedOrders = orders.map(order => ({
      ...order,
      orderId: order.orderId.toString(),
      productId: order.productId.toString(),
      orderDate: moment(order.orderDate).format('YYYY-MM-DD HH:mm:ss')
    }));
    
    // Write to CSV
    await csvWriter.writeRecords(formattedOrders);
    
    // Send file
    res.download(tempFilePath, `sales-export-${timestamp}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      
      // Delete temp file after sending
      unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temp file:', unlinkErr);
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}