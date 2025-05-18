import { create, find, countDocuments, findById, findByIdAndUpdate, aggregate } from '../models/Order';
import { findById as _findById } from '../models/Product';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export async function createOrder(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      products,
      paymentMethod,
      paymentStatus,
      customerDemographics,
      referralSource,
      deviceInfo
    } = req.body;

    // Validate products
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products in the order'
      });
    }

    // Calculate total amount and validate product availability
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await _findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
      
      // Check if product is available
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.title} is not available`
        });
      }
      
      // Check if enough inventory
      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough inventory for ${product.title}. Available: ${product.inventory}`
        });
      }
      
      // Add product to order
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      // Calculate total
      totalAmount += product.price * item.quantity;
      
      // Update inventory
      product.inventory -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await create({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      products: orderProducts,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: 'pending',
      customerDemographics,
      referralSource,
      deviceInfo
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export async function getAllOrders(req, res) {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { 'shippingAddress.country': { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders
    const orders = await find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('products.product', 'title price image');
    
    // Get total count
    const total = await countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    
    const order = await findById(id)
      .populate('products.product', 'title price image description origin');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, notes } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (notes) updates.notes = notes;
    
    // Add updatedAt timestamp
    updates.updatedAt = Date.now();
    
    const order = await findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('products.product', 'title price image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    
    const order = await findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Return products to inventory if order is not completed or cancelled
    if (order.status !== 'completed' && order.status !== 'cancelled') {
      for (const item of order.products) {
        const product = await _findById(item.product);
        if (product) {
          product.inventory += item.quantity;
          await product.save();
        }
      }
    }
    
    await order.remove();
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
export async function getOrderStats(req, res) {
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
    
    // Get order counts by status
    const ordersByStatus = await aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get order counts by payment status
    const ordersByPaymentStatus = await aggregate([
      { $match: dateFilter },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);
    
    // Get average order value
    const avgOrderValue = await aggregate([
      { $match: dateFilter },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);
    
    // Get total revenue
    const totalRevenue = await aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Get daily order counts
    const dailyOrders = await aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        ordersByStatus,
        ordersByPaymentStatus,
        avgOrderValue: avgOrderValue.length > 0 ? avgOrderValue[0].avg : 0,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        dailyOrders
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

// @desc    Track order
// @route   GET /api/orders/track/:id
// @access  Public
export async function trackOrder(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for order tracking'
      });
    }
    
    const order = await findById(id)
      .select('customerName customerEmail status trackingNumber createdAt updatedAt shippingAddress products totalAmount')
      .populate('products.product', 'title image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify that the email matches the order
    if (order.customerEmail !== email) {
      return res.status(403).json({
        success: false,
        message: 'Email does not match order'
      });
    }
    
    // Get order timeline
    const timeline = [];
    
    // Order placed
    timeline.push({
      status: 'Order Placed',
      date: order.createdAt,
      completed: true
    });
    
    // Order processing
    if (['processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
      timeline.push({
        status: 'Processing',
        date: order.updatedAt,
        completed: true
      });
    } else {
      timeline.push({
        status: 'Processing',
        completed: false
      });
    }
    
    // Order shipped
    if (['shipped', 'delivered', 'completed'].includes(order.status)) {
      timeline.push({
        status: 'Shipped',
        date: order.updatedAt,
        completed: true,
        trackingNumber: order.trackingNumber
      });
    } else {
      timeline.push({
        status: 'Shipped',
        completed: false
      });
    }
    
    // Order delivered
    if (['delivered', 'completed'].includes(order.status)) {
      timeline.push({
        status: 'Delivered',
        date: order.updatedAt,
        completed: true
      });
    } else {
      timeline.push({
        status: 'Delivered',
        completed: false
      });
    }
    
    // Order completed
    if (order.status === 'completed') {
      timeline.push({
        status: 'Completed',
        date: order.updatedAt,
        completed: true
      });
    } else {
      timeline.push({
        status: 'Completed',
        completed: false
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        order: {
          id: order._id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          status: order.status,
          trackingNumber: order.trackingNumber,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          shippingAddress: order.shippingAddress,
          products: order.products,
          totalAmount: order.totalAmount
        },
        timeline
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