import WorkspaceMember from '../models/WorkspaceMember.js';

/**
 * Factory: returns middleware that checks if the authenticated user
 * has one of the allowed roles in the current workspace.
 *
 * Usage:  requireRole(['admin', 'owner'])
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const member = await WorkspaceMember.findOne({
        workspace: req.workspace._id,
        user: req.user._id,
      });

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        });
      }

      req.memberRole = member.role;
      next();
    } catch {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Role check failed' },
      });
    }
  };
};

export default requireRole;
