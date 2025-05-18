import { findOne, create, findById, findByIdAndUpdate } from '../models/User';
import { create as _create } from '../models/Cart';
import { find, findById as _findById } from '../models/Order';
import { sign } from 'jsonwebtoken';
import { createHash } from 'crypto';
import { createTransport } from 'nodemailer';

// Generate JWT Token
const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export async function registerUser(req, res) {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Generate verification token
    const verificationToken = user.getVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
    
    const transporter = createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering! Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't register for an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Create empty cart for user
    await _create({ user: user._id, items: [] });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
      },
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
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

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    
    // Hash token
    const verificationToken = createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token
    const user = await findOne({ verificationToken });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    // Set user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;
    
    // Send email
    const transporter = createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>This link will expire in 10 minutes.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Reset password
// @route   PUT /api/users/reset-password/:token
// @access  Public
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash token
    const resetPasswordToken = createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token and check if token is expired
    const user = await findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export async function getUserProfile(req, res) {
  try {
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist,
        demographics: user.demographics,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export async function updateUserProfile(req, res) {
  try {
    const { firstName, lastName, phone, demographics } = req.body;
    
    // Build update object
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (demographics) updateFields.demographics = demographics;
    
    const user = await findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        demographics: user.demographics
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

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export async function addAddress(req, res) {
  try {
    const { addressType, street, city, state, postalCode, country, isDefault } = req.body;
    
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create new address
    const newAddress = {
      addressType,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    };
    
    // If new address is default, set all other addresses to non-default
    if (newAddress.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    // Add new address
    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
export async function updateAddress(req, res) {
  try {
    const { addressType, street, city, state, postalCode, country, isDefault } = req.body;
    
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find address by ID
    const address = user.addresses.id(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Update address fields
    if (addressType) address.addressType = addressType;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    
    // Handle default address
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
export async function deleteAddress(req, res) {
  try {
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find address by ID
    const address = user.addresses.id(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Remove address
    address.remove();
    await user.save();
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
export async function getUserOrders(req, res) {
  try {
    const orders = await find({ customerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .populate('products.product', 'title price image');
    
    res.status(200).json({
      success: true,
      count: orders.length,
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

// @desc    Get order details
// @route   GET /api/users/orders/:id
// @access  Private
export async function getUserOrderDetails(req, res) {
  try {
    const order = await _findById(req.params.id)
      .populate('products.product', 'title price image description');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to user
    if (order.customerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
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

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();
    
    // Get populated wishlist
    const populatedUser = await findById(req.user.id)
      .populate('wishlist', 'title price image');
    
    res.status(200).json({
      success: true,
      wishlist: populatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    
    const user = await findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    );
    
    await user.save();
    
    // Get populated wishlist
    const populatedUser = await findById(req.user.id)
      .populate('wishlist', 'title price image');
    
    res.status(200).json({
      success: true,
      wishlist: populatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
export async function getWishlist(req, res) {
  try {
    const user = await findById(req.user.id)
      .populate('wishlist', 'title price image description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}