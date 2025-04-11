/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param {string|string[]} roles - Required role(s) to access the route
 */
exports.authorize = (roles) => {
    return (req, res, next) => {
      // Convert single role to array for consistent processing
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user exists on request (from auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }
      
      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role ${req.user.role} is not authorized to access this route`,
        });
      }
      
      next();
    };
  };
  
  // Constants for user roles (imported from User model)
  exports.ROLES = {
    STANDARD_USER: "Standard User",
    ORGANIZER: "Organizer",
    SYSTEM_ADMIN: "System Admin"
  };