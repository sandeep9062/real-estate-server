import { auth } from "../config/auth.js";
import User from "../models/User.js";

// Middleware to protect routes using better-auth sessions
export const betterAuthProtect = async (req, res, next) => {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get full user data from database
    const user = await User.findById(session.user.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error("Better-auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

// Middleware to check if user is admin
export const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// Middleware to check if user is admin or agent
export const checkAdminOrAgent = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "agent")) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins or agents only." });
  }
};

// Optional middleware - attaches user if authenticated, but doesn't require it
export const optionalAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session && session.user) {
      const user = await User.findById(session.user.id).select("-password");
      if (user && user.isActive) {
        req.user = user;
        req.session = session;
      }
    }
    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};