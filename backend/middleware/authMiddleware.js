import { verify } from 'jsonwebtoken';
import { findById } from '../models/Admin.js';

// Protect routes - verify JWT token
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
    
    // Get admin from token
    req.admin = await findById(decoded.id);
    
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found with this ID'
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

// Admin role authorization
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.admin.role} is not authorized to access this route`
      });
    }
    next();
  };
}