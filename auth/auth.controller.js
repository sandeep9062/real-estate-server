import * as authService from "./auth.service.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
  extractTokensFromRequest,
} from "./jwt.utils.js";

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

/**
 * Get client metadata from request
 */
const getClientMetadata = (req) => ({
  userAgent: req.headers["user-agent"] || "Unknown",
  ipAddress:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.ip ||
    "Unknown",
});

/**
 * Register new user
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { userAgent, ipAddress } = getClientMetadata(req);

    const result = await authService.registerUser(
      req.body,
      userAgent,
      ipAddress,
    );

    // Set cookies
    res.cookie(
      "accessToken",
      result.accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      "refreshToken",
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: result.user,
    });
  } catch (error) {
    console.error("Register error:", error.message);

    // Don't expose internal error details
    const message =
      error.message === "Email already registered"
        ? error.message
        : error.message.includes("required") ||
            error.message.includes("Invalid") ||
            error.message.includes("Password")
          ? error.message
          : "Registration failed. Please try again.";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { userAgent, ipAddress } = getClientMetadata(req);

    const result = await authService.loginUser(
      email,
      password,
      userAgent,
      ipAddress,
    );

    // Set cookies
    res.cookie(
      "accessToken",
      result.accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      "refreshToken",
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    // Generic error message for security
    const message = error.message.includes("banned")
      ? error.message
      : "Invalid email or password";

    res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * Google OAuth login/register
 * POST /auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const { userAgent, ipAddress } = getClientMetadata(req);

    const result = await authService.googleAuth(idToken, userAgent, ipAddress);

    // Set cookies
    res.cookie(
      "accessToken",
      result.accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      "refreshToken",
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: result.user,
    });
  } catch (error) {
    console.error("Google auth error:", error.message);

    res.status(401).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
};

/**
 * Refresh access token
 * POST /auth/refresh
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = extractTokensFromRequest(req);
    const { userAgent, ipAddress } = getClientMetadata(req);

    const result = await authService.refreshTokens(
      refreshToken,
      userAgent,
      ipAddress,
    );

    // Set new cookies
    res.cookie(
      "accessToken",
      result.accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      "refreshToken",
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: result.user,
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);

    // Clear cookies on refresh failure
    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());

    res.status(401).json({
      success: false,
      message: error.message || "Token refresh failed",
    });
  }
};

/**
 * Logout user (single device)
 * POST /auth/logout
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = extractTokensFromRequest(req);

    await authService.logoutUser(refreshToken);

    // Clear cookies
    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    // Still clear cookies even on error
    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

/**
 * Logout from all devices
 * POST /auth/logout-all
 */
export const logoutAll = async (req, res) => {
  try {
    await authService.logoutAllDevices(req.user._id);

    // Clear cookies
    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

/**
 * Get current user
 * GET /auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

/**
 * Ban user (admin only)
 * POST /admin/ban/:userId
 */
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await authService.banUser(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Ban user error:", error.message);

    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Cannot ban")
        ? 403
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to ban user",
    });
  }
};

/**
 * Unban user (admin only)
 * POST /admin/unban/:userId
 */
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await authService.unbanUser(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Unban user error:", error.message);

    const statusCode = error.message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to unban user",
    });
  }
};
