import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export async function getCart(req, res) {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title price image inventory isAvailable');
    
    if (!cart) {
      // Create cart if it doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total
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

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough inventory. Available: ${product.inventory}`
      });
    }
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      // Create cart if it doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    await cart.save();
    
    // Get updated cart with populated products
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title price image inventory isAvailable');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total
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

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Validate product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough inventory. Available: ${product.inventory}`
      });
    }
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Get updated cart with populated products
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title price image inventory isAvailable');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export async function removeCartItem(req, res) {
  try {
    const { productId } = req.params;
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    await cart.save();
    
    // Get updated cart with populated products
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title price image inventory isAvailable');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        total
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

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export async function clearCart(req, res) {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear cart items
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        items: [],
        total: 0
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