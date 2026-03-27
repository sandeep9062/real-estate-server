import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
} from "./jwt.utils.js";
import { createNotification } from "../controllers/notificationController.js";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authentication Service
 * Handles all authentication business logic
 */

/**
 * Register a new user
 */
export const registerUser = async (userData, userAgent, ipAddress) => {
  const { name, email, password, phone } = userData;

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || "",
    role: "user",
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

  // Store hashed refresh token
  await user.addRefreshToken(hashedRefreshToken, userAgent, ipAddress);

  // Create notification for admins (non-blocking)
  createAdminNotification(user).catch(console.error);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: rawRefreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password, userAgent, ipAddress) => {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is banned
  if (user.isBanned) {
    throw new Error("Your account has been banned. Please contact support.");
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Clean expired tokens
  await user.cleanExpiredTokens();

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

  // Store hashed refresh token
  await user.addRefreshToken(hashedRefreshToken, userAgent, ipAddress);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: rawRefreshToken,
  };
};

/**
 * Google OAuth login/register
 */
export const googleAuth = async (idToken, userAgent, ipAddress) => {
  if (!idToken) {
    throw new Error("Google ID token is required");
  }

  // Verify Google ID token
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("Google token verification failed:", error.message);
    throw new Error("Invalid Google token");
  }

  const { email, name, picture, sub: googleId } = payload;

  if (!email) {
    throw new Error("Google account does not have an email");
  }

  // Find or create user
  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    // Existing user - check if banned
    if (user.isBanned) {
      throw new Error("Your account has been banned. Please contact support.");
    }

    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      googleId,
      image: picture,
      role: "user",
    });

    // Create notification for admins (non-blocking)
    createAdminNotification(user).catch(console.error);
  }

  // Clean expired tokens
  await user.cleanExpiredTokens();

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

  // Store hashed refresh token
  await user.addRefreshToken(hashedRefreshToken, userAgent, ipAddress);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: rawRefreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshTokens = async (refreshToken, userAgent, ipAddress) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  // Hash the provided refresh token
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Find user with this refresh token
  const user = await User.findOne({
    "refreshTokens.token": hashedRefreshToken,
  });

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  // Check if user is banned
  if (user.isBanned) {
    // Remove the refresh token
    await user.removeRefreshToken(hashedRefreshToken);
    throw new Error("Your account has been banned");
  }

  // Check token version (for logout all devices)
  const accessToken = generateAccessToken(user);
  const decoded = verifyAccessToken(accessToken);

  if (decoded.tokenVersion !== user.tokenVersion) {
    // Token version mismatch - user has logged out from all devices
    await user.removeRefreshToken(hashedRefreshToken);
    throw new Error("Session expired. Please login again.");
  }

  // Remove old refresh token (rotation)
  await user.removeRefreshToken(hashedRefreshToken);

  // Clean expired tokens
  await user.cleanExpiredTokens();

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRawRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashRefreshToken(newRawRefreshToken);

  // Store new refresh token
  await user.addRefreshToken(newHashedRefreshToken, userAgent, ipAddress);

  return {
    user: user.toJSON(),
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
  };
};

/**
 * Logout user (single device)
 */
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    // No refresh token - just return success
    return { success: true };
  }

  // Hash the refresh token
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Find user and remove the token
  const user = await User.findOne({
    "refreshTokens.token": hashedRefreshToken,
  });

  if (user) {
    await user.removeRefreshToken(hashedRefreshToken);
  }

  return { success: true };
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Clear all refresh tokens and increment token version
  await user.clearRefreshTokens();

  return { success: true };
};

/**
 * Get current user
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -refreshTokens -resetPasswordToken -resetPasswordExpire")
    .populate("favProperties")
    .populate("bookedVisits")
    .populate("ownedProperties");

  if (!user) {
    throw new Error("User not found");
  }

  return user.toJSON();
};

/**
 * Verify access token and get user
 */
export const verifyTokenAndGetUser = async (accessToken) => {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  // Verify the token
  const decoded = verifyAccessToken(accessToken);

  // Get user
  const user = await User.findById(decoded.userId).select(
    "-password -refreshTokens -resetPasswordToken -resetPasswordExpire",
  );

  if (!user) {
    throw new Error("User not found");
  }

  // Check if banned
  if (user.isBanned) {
    throw new Error("Account has been banned");
  }

  // Check token version
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new Error("Session expired. Please login again.");
  }

  return { user, decoded };
};

/**
 * Ban user (admin only)
 */
export const banUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Cannot ban an admin user");
  }

  user.isBanned = true;
  await user.clearRefreshTokens(); // This also increments tokenVersion
  await user.save();

  return { success: true, message: "User banned successfully" };
};

/**
 * Unban user (admin only)
 */
export const unbanUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isBanned = false;
  await user.save();

  return { success: true, message: "User unbanned successfully" };
};

/**
 * Create admin notification for new user registration
 */
const createAdminNotification = async (user) => {
  const adminUsers = await User.find({ role: "admin" });

  for (const admin of adminUsers) {
    await createNotification({
      userId: admin._id,
      title: "New User Registration",
      message: `${user.name} (${user.email}) has registered`,
      type: "info",
      category: "user",
      priority: "low",
      metadata: {
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      },
      actionUrl: `/dashboard/users/${user._id}`,
    });
  }
};
