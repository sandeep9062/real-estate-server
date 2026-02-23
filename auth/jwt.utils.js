import jwt from "jsonwebtoken";
import crypto from "crypto";

// Token expiry constants
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Cookie max age constants (in milliseconds)
const ACCESS_TOKEN_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate Access Token
 * Contains: userId, role, tokenVersion
 * Expires: 15 minutes
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "propertybulbul.com",
    audience: "propertybulbul.com",
  });
};

/**
 * Generate Refresh Token
 * Returns a random token (not JWT) that will be hashed and stored in DB
 * Expires: 7 days
 */
export const generateRefreshToken = () => {
  // Generate a cryptographically secure random token
  const rawToken = crypto.randomBytes(64).toString("hex");
  return rawToken;
};

/**
 * Hash refresh token for storage
 * Uses SHA-256 for one-way hashing
 */
export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verify Access Token
 * Returns decoded payload or throws error
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: "propertybulbul.com",
      audience: "propertybulbul.com",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const expiredError = new Error("Access token expired");
      expiredError.code = "ACCESS_TOKEN_EXPIRED";
      throw expiredError;
    }
    if (error.name === "JsonWebTokenError") {
      const invalidError = new Error("Invalid access token");
      invalidError.code = "INVALID_ACCESS_TOKEN";
      throw invalidError;
    }
    throw error;
  }
};

/**
 * Get cookie options for access token
 * Production-safe configuration for cross-subdomain cookies
 * In development: no domain, lax sameSite, not secure
 * In production: .propertybulbul.com domain, none sameSite, secure
 */
export const getAccessTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".propertybulbul.com" : undefined,
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
    path: "/",
  };
};

/**
 * Get cookie options for refresh token
 * Production-safe configuration for cross-subdomain cookies
 */
export const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".propertybulbul.com" : undefined,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    path: "/",
  };
};

/**
 * Clear cookie options (for logout)
 */
export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".propertybulbul.com" : undefined,
    path: "/",
  };
};

/**
 * Extract tokens from request
 * Checks both cookies and Authorization header
 */
export const extractTokensFromRequest = (req) => {
  let accessToken = null;
  let refreshToken = null;

  // Extract from cookies
  if (req.cookies) {
    accessToken = req.cookies.accessToken || null;
    refreshToken = req.cookies.refreshToken || null;
  }

  // Also check Authorization header for access token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.substring(7);
  }

  return { accessToken, refreshToken };
};

/**
 * Calculate refresh token expiry date
 */
export const getRefreshTokenExpiry = () => {
  return new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE);
};
