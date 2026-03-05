import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const requireSchoolAccess = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next(); // Super admin can access any school
  }

  if (!req.user.schoolId) {
    return res.status(403).json({ message: 'School access required' });
  }

  // For school-level operations, ensure user's schoolId matches
  const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  
  if (requestedSchoolId && req.user.schoolId !== requestedSchoolId) {
    return res.status(403).json({ message: 'Access denied. Cannot access other school data.' });
  }

  next();
};
