import Order from '../models/Order.js';
import Product from '../models/Product.js';

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

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products in the order' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${item.product} not found` });
      }
      if (!product.isAvailable) {
        return res.status(400).json({ success: false, message: `Product ${product.title} is not available` });
      }
      if (product.inventory < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough inventory for ${product.title}. Available: ${product.inventory}` });
      }

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
      product.inventory -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
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

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export async function getAllOrders(req, res) {
  try {
    const {
      status, page = 1, limit = 10,
      startDate, endDate, search,
      sort = 'createdAt', order = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
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

    const sortOptions = { [sort]: order === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('products.product', 'title price image');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('products.product', 'title price image description origin');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    updates.updatedAt = Date.now();

    const order = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('products.product', 'title price image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.inventory += item.quantity;
          await product.save();
        }
      }
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
export async function getOrderStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ordersByPaymentStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const avgOrderValue = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const dailyOrders = await Order.aggregate([
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
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        dailyOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
      return res.status(400).json({ success: false, message: 'Email is required for tracking' });
    }

    const order = await Order.findOne({ _id: id, customerEmail: email }).populate('products.product', 'title price image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or email mismatch' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
