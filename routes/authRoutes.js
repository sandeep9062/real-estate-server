import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  changePassword,
  updateProfile,
  getCurrentUser,
  syncUser,
} from "../controllers/authController.js";

/**
 * Authentication Routes
 * 
 * Better Auth handles the core authentication flows:
 * - Sign up: POST /api/better-auth/sign-up/email
 * - Sign in: POST /api/better-auth/sign-in/email
 * - Sign out: POST /api/better-auth/sign-out
 * - Social login: GET /api/better-auth/sign-in/social
 * - Password reset: POST /api/better-auth/forgot-password
 * - Session: GET /api/better-auth/session
 * 
 * These routes provide additional functionality:
 * - Password change for authenticated users
 * - Profile management
 * - User sync from Better Auth to User collection
 */

const router = express.Router();

// Sync user from Better Auth to User collection (call after sign up)
router.post("/sync", protect, syncUser);

// Get current user profile
router.get("/me", protect, getCurrentUser);

// Update user profile
router.put("/profile", protect, updateProfile);

// Change password (for authenticated users)
router.post("/change-password", protect, changePassword);

export default router;