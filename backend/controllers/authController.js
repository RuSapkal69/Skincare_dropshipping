const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Register admin (for initial setup or by super-admin)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Create admin
    const admin = await Admin.create({
      username,
      password,
      email,
      role: role || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate OTP for login
// @route   POST /api/admin/login/otp/generate
// @access  Public
exports.generateLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found with this email'
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Set OTP expiry (10 minutes)
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    
    // Save OTP to admin document
    admin.otpHash = otpHash;
    admin.otpExpiry = otpExpiry;
    await admin.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Admin Login OTP',
      text: `Your OTP for admin login is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Admin Login OTP</h2>
          <p>Your one-time password for admin login is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px; text-align: center;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify OTP and login
// @route   POST /api/admin/login/otp/verify
// @access  Public
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found with this email'
      });
    }

    // Check if OTP exists and is not expired
    if (!admin.otpHash || !admin.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP not generated or already used'
      });
    }

    if (Date.now() > admin.otpExpiry) {
      // Clear expired OTP
      admin.otpHash = undefined;
      admin.otpExpiry = undefined;
      await admin.save();
      
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one'
      });
    }

    // Verify OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedOTP !== admin.otpHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Clear used OTP
    admin.otpHash = undefined;
    admin.otpExpiry = undefined;
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};