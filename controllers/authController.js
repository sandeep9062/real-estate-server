import bcrypt from "bcryptjs";
import User from "../models/User.js";
import crypto from "crypto";
import { createNotification } from "./notificationController.js";
import { sendForgotPasswordEmail } from "../utils/send-email.js";
import { auth } from "../config/auth.js";

/**
 * Authentication Controller
 * 
 * This controller works alongside Better Auth to provide:
 * - Additional user management functionality
 * - Password change for authenticated users
 * - User profile operations
 * 
 * Better Auth handles:
 * - Sign up (POST /api/better-auth/sign-up/email)
 * - Sign in (POST /api/better-auth/sign-in/email)
 * - Sign out (POST /api/better-auth/sign-out)
 * - Social login (GET /api/better-auth/sign-in/social)
 * - Password reset (POST /api/better-auth/forgot-password)
 * - Session management
 */

// ==================
// CHANGE PASSWORD
// ==================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get user from database (attached by auth middleware)
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================
// UPDATE USER PROFILE
// ==================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, image } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (image) user.image = image;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        favProperties: user.favProperties,
        bookedVisits: user.bookedVisits,
        ownedProperties: user.ownedProperties,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================
// GET CURRENT USER PROFILE
// ==================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("favProperties")
      .populate("bookedVisits")
      .populate("ownedProperties");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================
// SYNC USER FROM BETTER AUTH
// ==================
// This endpoint ensures a user exists in the User collection
// after signing up with Better Auth
export const syncUser = async (req, res) => {
  try {
    const session = req.session;
    
    if (!session || !session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const betterAuthUser = session.user;
    
    // Check if user exists in our User collection
    let user = await User.findOne({ email: betterAuthUser.email });

    if (!user) {
      // Create user in our collection for backward compatibility
      // This allows the User model's hooks and methods to work
      user = await User.create({
        name: betterAuthUser.name || betterAuthUser.email.split('@')[0],
        email: betterAuthUser.email,
        phone: betterAuthUser.phone || '',
        role: betterAuthUser.role || 'user',
        image: betterAuthUser.image || '',
        // No password - Better Auth manages authentication
        password: undefined,
      });

      // Create notification for admins
      try {
        const adminUsers = await User.find({ role: 'admin' });
        for (const admin of adminUsers) {
          await createNotification({
            userId: admin._id,
            title: `New User Registration`,
            message: `${user.name} (${user.email}) has registered`,
            type: 'info',
            category: 'user',
            priority: 'low',
            metadata: {
              userId: user._id,
              userEmail: user.email,
              userRole: user.role,
            },
            actionUrl: `/dashboard/users/${user._id}`,
          });
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        favProperties: user.favProperties || [],
        bookedVisits: user.bookedVisits || [],
        ownedProperties: user.ownedProperties || [],
      },
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};