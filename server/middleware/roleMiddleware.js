/**
 * middleware/roleMiddleware.js — Role-Based Access Control
 *
 * WHY: Some routes should only be accessible by certain user roles.
 * For example, only admins can delete any post, only organizations
 * can update rescue case status.
 *
 * Usage (always use AFTER authMiddleware):
 *   router.get('/admin/users',
 *     authMiddleware,
 *     roleMiddleware('admin'),
 *     adminController.getUsers
 *   )
 *
 *   router.patch('/rescues/:id/status',
 *     authMiddleware,
 *     roleMiddleware(['organization', 'admin']),
 *     rescueController.updateStatus
 *   )
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'organization', 'person')
 */

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware (must run before this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      })
    }

    next()
  }
}

module.exports = roleMiddleware
