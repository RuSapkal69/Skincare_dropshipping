import { verify } from 'jsonwebtoken';
import { findById } from '../models/User';

// Protect routes - verify JWT token for users
export async function protect(req, res, next) {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found with this ID'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
}

// Verify email middleware
export async function verifiedOnly(req, res, next) {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this resource'
    });
  }
  
  next();
}