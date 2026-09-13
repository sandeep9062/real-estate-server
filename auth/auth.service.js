import User from "../models/User.js";
import Agent from "../models/Agent.js";
import Landlord from "../models/Landlord.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
} from "./jwt.utils.js";
import { createNotification } from "../controllers/notificationController.js";
import { notifyWelcomeEmail } from "../utils/transactionalEmails.js";
import { normalizePhone } from "../utils/phone.js";

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
  if (!name || !email || !password || !phone) {
    throw new Error("Name, email, password and phone are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Phone numbers are stored WITH the country code (E.164, e.g. +919876543210)
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error(
      "Invalid phone number. Please include the country code, e.g. +919876543210",
    );
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

  // Phone numbers must be unique across users
  const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
  if (existingPhoneUser) {
    throw new Error("Phone number already registered");
  }

  // Create user
  let user;
  try {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: normalizedPhone,
      role: "user",
    });
  } catch (err) {
    // Duplicate key from the unique email/phone index (race-condition safety)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "email";
      throw new Error(
        field === "phone"
          ? "Phone number already registered"
          : "Email already registered",
      );
    }
    throw err;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

  // Store hashed refresh token
  await user.addRefreshToken(hashedRefreshToken, userAgent, ipAddress);

  // Create notification for admins (non-blocking)
  createAdminNotification(user).catch(console.error);

  notifyWelcomeEmail({ to: user.email, userName: user.name }).catch((err) =>
    console.warn("Welcome email skipped:", err.message),
  );

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
export const googleAuth = async (idToken, phone, userAgent, ipAddress) => {
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
  const isNewUser = !user;

  if (user) {
    // Existing user - check if banned
    if (user.isBanned) {
      throw new Error("Your account has been banned. Please contact support.");
    }

    // Phone is mandatory — attach it for legacy Google users that are
    // still missing one. The frontend drives this via the phone-capture
    // modal and a second /auth/google call with the phone included.
    if (!user.phone) {
      const error = new Error(
        "Phone number is required. Please enter your phone number to continue.",
      );
      error.code = "PHONE_REQUIRED";
      if (!phone) {
        throw error;
      }
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        error.message =
          "Invalid phone number. Please include the country code, e.g. +919876543210";
        throw error;
      }
      // Phone numbers must be unique across users
      const existingPhoneUser = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      });
      if (existingPhoneUser) {
        throw new Error("Phone number already registered");
      }
      user.phone = normalizedPhone;
    }

    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    } else if (user.isModified("phone")) {
      await user.save();
    }
  } else {
    // Phone is mandatory for every account (stored WITH country code)
    if (!phone) {
      const error = new Error(
        "Phone number is required. Please enter your phone number to continue.",
      );
      error.code = "PHONE_REQUIRED";
      throw error;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      const error = new Error(
        "Invalid phone number. Please include the country code, e.g. +919876543210",
      );
      error.code = "PHONE_REQUIRED";
      throw error;
    }

    // Phone numbers must be unique across users
    const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
    if (existingPhoneUser) {
      throw new Error("Phone number already registered");
    }

    // Create new user
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      googleId,
      image: picture,
      phone: normalizedPhone,
      role: "user",
    });

    // Create notification for admins (non-blocking)
    createAdminNotification(user).catch(console.error);

    notifyWelcomeEmail({ to: user.email, userName: user.name }).catch((err) =>
      console.warn("Welcome email skipped:", err.message),
    );
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
    // Tells the frontend whether this Google sign-in just created the
    // account — new accounts must always go through role selection.
    isNewUser,
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
 * Ensure an Agent profile doc exists for a user.
 *
 * Idempotent: if a doc already exists (e.g. created via the old public
 * /api/agents/register wizard), it is returned untouched — no fields are
 * overwritten. Used by select-role and as the lazy fallback on profile fetch.
 */
export const ensureAgentProfile = async (user) => {
  let agent = await Agent.findOne({ userID: user._id });
  if (!agent) {
    agent = await Agent.create({
      userID: user._id,
      name: user.name,
      phone: user.phone || "",
      email: user.email,
    });
  }
  return agent;
};

/**
 * Ensure a Landlord profile doc exists for a user (same idempotency rules).
 */
export const ensureLandlordProfile = async (user) => {
  let landlord = await Landlord.findOne({ userID: user._id });
  if (!landlord) {
    landlord = await Landlord.create({
      userID: user._id,
      name: user.name,
      phone: user.phone || "",
      email: user.email,
    });
  }
  return landlord;
};

/**
 * Select a role (agent | landlord) for a user who hasn't picked one yet.
 *
 * - Rejects invalid roles (400) and users who already have a role (409).
 *   admin/builder accounts are also rejected — this endpoint must never
 *   demote a privileged role.
 * - Sets user.role, then idempotently creates the matching profile doc
 *   (findOne-then-create; existing docs are never overwritten).
 * - Returns the updated user + a fresh access token reflecting the new role
 *   (role is embedded in the JWT payload).
 *
 * Note: the codebase does not use Mongo transactions anywhere, so steps run
 * sequentially. If profile creation fails after the role was saved, the error
 * is logged loudly with `roleSaved: true` — the profile is re-created lazily
 * on the next GET /api/agents/me or /api/landlords/me call, so the user is
 * not stuck.
 */
export const selectUserRole = async (userId, role) => {
  if (!role || !["agent", "landlord"].includes(role)) {
    const error = new Error("Invalid role. Must be 'agent' or 'landlord'.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "user") {
    const isPickedRole = user.role === "agent" || user.role === "landlord";
    const error = new Error(
      isPickedRole
        ? "You have already selected a role. Role switching is handled by support."
        : `Role selection is not available for '${user.role}' accounts.`,
    );
    error.statusCode = 409;
    throw error;
  }

  // Step 1: set the role
  user.role = role;
  await user.save();

  // Step 2: create (or reuse) the profile doc
  try {
    const profile =
      role === "agent"
        ? await ensureAgentProfile(user)
        : await ensureLandlordProfile(user);

    const accessToken = generateAccessToken(user);

    return { user: user.toJSON(), profile, accessToken };
  } catch (error) {
    console.error(
      `❌ selectUserRole: role '${role}' saved for user ${user._id} (${user.email}) but profile creation failed: ${error.message}`,
    );
    const wrapped = new Error(
      "Your role was updated but we couldn't finish setting up your profile. It will be created automatically next time you open your dashboard — please try again.",
    );
    wrapped.statusCode = 500;
    wrapped.roleSaved = true;
    throw wrapped;
  }
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
