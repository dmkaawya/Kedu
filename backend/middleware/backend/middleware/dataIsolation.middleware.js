// Middleware to automatically inject schoolId for data isolation
export const enforceDataIsolation = (req, res, next) => {
  // Super admin can access all schools (explicit schoolId in query/params)
  if (req.user.role === 'super_admin') {
    return next();
  }

  // For all other roles, enforce school-level isolation
  if (req.user.schoolId) {
    // Automatically set schoolId in query/body if not present
    if (req.method === 'GET' || req.method === 'DELETE') {
      req.query.schoolId = req.user.schoolId;
    } else {
      req.body.schoolId = req.user.schoolId;
    }
    
    // Override any schoolId in params/body to prevent cross-school access
    if (req.params.schoolId && req.params.schoolId !== req.user.schoolId) {
      return res.status(403).json({ message: 'Cannot access other school data' });
    }
  }

  next();
};
