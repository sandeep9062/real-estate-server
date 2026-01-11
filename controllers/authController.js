import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import axios from "axios";

import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import { createNotification } from "./notificationController.js";
import { sendForgotPasswordEmail } from "../utils/send-email.js";

const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

// ==================
// NORMAL SIGNUP
// ==================
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "user", // Default role to 'user' if not provided
    });

    // Create notifications for admins when a new user registers
    try {
      const adminUsers = await User.find({ role: 'admin' });

      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id,
          title: `New User Registration`,
          message: `${name} (${email}) has registered as a ${user.role}`,
          type: 'info',
          category: 'user',
          priority: 'low',
          metadata: {
            userId: user._id,
            userEmail: email,
            userRole: user.role,
          },
          actionUrl: `/dashboard/users/${user._id}`,
        });
      }
    } catch (notificationError) {
      console.error('Error creating user registration notification:', notificationError);
      // Don't fail registration if notification creation fails
    }

    const token = generateToken(user);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        favProperties: user.favProperties || [],
        bookedVisits: user.bookedVisits || [],
        ownedProperties: user.ownedProperties || [],
      },
      token,
      message: "user Registered Succesfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ==================
// NORMAL LOGIN
// ==================
export const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    }).populate("favProperties");

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    const {
      _id,
      name,
      email,
      role,
      phone,
      favProperties,
      image,
      bookedVisits,
      ownedProperties,
    } = user;
    res.status(200).json({
      user: {
        _id,
        name,
        email,
        role,
        phone,
        favProperties,
        image,
        bookedVisits,
        ownedProperties,
      },
      token,
      role: user.role,
      message: "User Logged in succesfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ==================
// GOOGLE LOGIN/SIGNUP
// ==================
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "YOUR_GOOGLE_CLIENT_ID",
    });

    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists, generate token and send back

      const jwtToken = generateToken(user);
      return res.status(200).json({ user, token: jwtToken });
    }

    // If new user, create account
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      googleId,
      role: "user", // default role; can update later
      image: picture,
    });

    // Create notifications for admins when a new user registers via Google
    try {
      const adminUsers = await User.find({ role: 'admin' });

      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id,
          title: `New User Registration (Google)`,
          message: `${name} (${email}) has registered via Google as a ${user.role}`,
          type: 'info',
          category: 'user',
          priority: 'low',
          metadata: {
            userId: user._id,
            userEmail: email,
            userRole: user.role,
            registrationMethod: 'google',
          },
          actionUrl: `/dashboard/users/${user._id}`,
        });
      }
    } catch (notificationError) {
      console.error('Error creating Google user registration notification:', notificationError);
      // Don't fail registration if notification creation fails
    }

    const jwtToken = generateToken(user);
    res.status(200).json({ user, token: jwtToken });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ message: "Google authentication failed", error });
  }
};

// ============================
// FORGOT PASSWORD
// ============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with this email" });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token to DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min expiry
    await user.save();

    // Create reset link - use localhost in development, production URL otherwise
    const isDevelopment = process.env.NODE_ENV === 'development';
    const resetLink = `${isDevelopment ? 'http://localhost:3000' : (process.env.FRONTEND_URL || 'http://localhost:3000')}/auth/reset-password/${resetToken}`;

    // Send email
    try {
      const emailResult = await sendForgotPasswordEmail({
        to: email,
        userName: user.name,
        resetLink: resetLink,
      });
    } catch (emailError) {
      console.error("Failed to send forgot password email:", emailError);
      // Don't fail the request if email sending fails, just log it
    }

    // In development mode, the email is not sent, but token is generated and link is logged
    if (isDevelopment) {
      console.log("🔄 Forgot password token generated for development testing");
      console.log("📧 Email sending skipped in development mode - use the link above for testing");
    }

    res.status(200).json({
      message: isDevelopment ? "Password reset link generated for development testing" : "Password reset email sent successfully",
      ...(isDevelopment && { resetLink }) // Include link in development response
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error sending reset email", error: error.message });
  }
};

// ===========================
// RESET PASSWORD
// ===========================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update password & clear token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ==================
// LOGOUT USER
// ==================
export const logoutUser = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
