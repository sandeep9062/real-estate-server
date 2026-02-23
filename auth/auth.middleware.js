import { verifyAccessToken, extractTokensFromRequest } from "./jwt.utils.js";
import User from "../models/User.js";

/**
 * Authentication Middleware
 * Validates JWT access tokens and attaches user to request
 */

/**
 * Require Authentication Middleware
 * Verifies access token and attaches user to req.user
 */
export const requireAuth = async (req, res, next) => {
  try {
    const { accessToken } = extractTokensFromRequest(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_TOKEN",
      });
    }

    // Verify the access token
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (error) {
      if (error.code === "ACCESS_TOKEN_EXPIRED") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "ACCESS_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        code: "INVALID_TOKEN",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens -resetPasswordToken -resetPasswordExpire",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
        code: "ACCOUNT_BANNED",
      });
    }

    // Check token version (for logout all devices)
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
        code: "SESSION_EXPIRED",
      });
    }

    // Attach user and token info to request
    req.user = user;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_FAILED",
    });
  }
};

/**
 * Require Role Middleware
 * Ensures user has the required role
 * @param {string|string[]} roles - Required role(s)
 */
export const requireRole = (roles) => {
  // Convert single role to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_USER",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if authenticated, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const { accessToken } = extractTokensFromRequest(req);

    if (!accessToken) {
      return next();
    }

    // Verify the access token
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (error) {
      // Token invalid or expired - continue without user
      return next();
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens -resetPasswordToken -resetPasswordExpire",
    );

    if (user && !user.isBanned && decoded.tokenVersion === user.tokenVersion) {
      req.user = user;
      req.tokenPayload = decoded;
    }
  } catch (error) {
    // Silently continue without user
  }

  next();
};

/**
 * Require Admin Middleware
 * Shorthand for requireRole('admin')
 */
export const requireAdmin = [requireAuth, requireRole("admin")];

/**
 * Require Admin or Agent Middleware
 */
export const requireAdminOrAgent = [
  requireAuth,
  requireRole(["admin", "agent"]),
];

/**
 * Check if user owns resource or is admin
 * @param {Function} getResourceUserId - Function to extract user ID from resource
 */
export const requireOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Admin has access to everything
      if (req.user.role === "admin") {
        return next();
      }

      // Get the resource user ID
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Check if user owns the resource
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You don't own this resource.",
        });
      }

      next();
    } catch (error) {
      console.error("Owner check error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};
