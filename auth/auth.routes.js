import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  googleAuth,
  refresh,
  logout,
  logoutAll,
  getCurrentUser,
  banUser,
  unbanUser,
} from "./auth.controller.js";
import { requireAuth, requireRole } from "./auth.middleware.js";

const router = express.Router();

/**
 * Rate Limiters
 * Protect authentication endpoints from brute force attacks
 * Note: trust proxy is set at app level, so req.ip will be the real client IP
 */

// Strict rate limiter for login and Google auth (10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for registration (5 requests per hour)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed rate limiter for token refresh (30 requests per 15 minutes)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 refresh requests per windowMs
  message: {
    success: false,
    message: "Too many token refresh attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public Routes
 */

// POST /auth/register - Register new user
router.post("/register", registerLimiter, register);

// POST /auth/login - Login with email/password
router.post("/login", authLimiter, login);

// POST /auth/google - Google OAuth login/register
router.post("/google", authLimiter, googleAuth);

// POST /auth/refresh - Refresh access token
router.post("/refresh", refreshLimiter, refresh);

// POST /auth/logout - Logout (single device)
router.post("/logout", logout);

/**
 * Protected Routes
 */

// GET /auth/me - Get current user
router.get("/me", requireAuth, getCurrentUser);

// POST /auth/logout-all - Logout from all devices
router.post("/logout-all", requireAuth, logoutAll);

/**
 * Admin Routes
 */

// POST /auth/admin/ban/:userId - Ban user (admin only)
router.post("/admin/ban/:userId", requireAuth, requireRole("admin"), banUser);

// POST /auth/admin/unban/:userId - Unban user (admin only)
router.post(
  "/admin/unban/:userId",
  requireAuth,
  requireRole("admin"),
  unbanUser,
);

export default router;
