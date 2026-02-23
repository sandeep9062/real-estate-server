/**
 * Authentication Middleware
 *
 * This file re-exports the new auth middleware for backward compatibility.
 * All existing routes using `protect` will continue to work.
 *
 * New implementation is in /auth/auth.middleware.js
 */

import {
  requireAuth,
  requireRole,
  optionalAuth,
  requireAdmin,
  requireAdminOrAgent,
  requireOwnerOrAdmin,
} from "../auth/auth.middleware.js";

/**
 * Legacy protect middleware
 * Maps to the new requireAuth middleware
 */
export const protect = requireAuth;

/**
 * Legacy checkAdmin middleware
 * Maps to the new requireRole middleware
 */
export const checkAdmin = requireRole("admin");

/**
 * Legacy checkAdminOrAgent middleware
 * Maps to the new requireAdminOrAgent middleware
 */
export const checkAdminOrAgent = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    requireRole(["admin", "agent"])(req, res, next);
  });
};

/**
 * Legacy optionalAuth middleware
 * Attaches user if authenticated, but doesn't require it
 */
export { optionalAuth };

/**
 * New middleware exports
 */
export {
  requireAuth,
  requireRole,
  requireAdmin,
  requireAdminOrAgent,
  requireOwnerOrAdmin,
};
