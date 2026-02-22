import { auth } from "../config/auth.js";
import User from "../models/User.js";

/**
 * Middleware to protect routes using Better Auth sessions
 * This is the primary authentication middleware for the application
 * 
 * Better Auth handles:
 * - Session management with secure cookies
 * - Email/password authentication
 * - Social login (Google)
 * - Password reset flows
 * 
 * This middleware validates the session and attaches the user to req.user
 */
export const protect = async (req, res, next) => {
  try {
    // Get session from Better Auth using the request headers
    // Better Auth automatically handles cookie-based sessions
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Try to find user in our User collection by email (for backward compatibility)
    // or by the Better Auth user ID
    let user = await User.findOne({ email: session.user.email }).select("-password");

    if (!user) {
      // User exists in Better Auth but not in our User collection
      // This can happen for new Better Auth users
      // Create a user object from Better Auth session data
      const betterAuthUser = session.user;
      
      user = {
        _id: betterAuthUser.id,
        id: betterAuthUser.id,
        name: betterAuthUser.name || betterAuthUser.email?.split('@')[0] || 'User',
        email: betterAuthUser.email,
        phone: betterAuthUser.phone || '',
        role: betterAuthUser.role || 'user',
        image: betterAuthUser.image || '',
        isActive: betterAuthUser.isActive !== false,
        favProperties: betterAuthUser.favProperties || [],
        bookedVisits: betterAuthUser.bookedVisits || [],
        ownedProperties: betterAuthUser.ownedProperties || [],
        createdAt: betterAuthUser.createdAt,
        updatedAt: betterAuthUser.updatedAt,
        toObject: function() {
          return {
            _id: this._id,
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            role: this.role,
            image: this.image,
            isActive: this.isActive,
            favProperties: this.favProperties,
            bookedVisits: this.bookedVisits,
            ownedProperties: this.ownedProperties,
          };
        }
      };
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
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
    // Try to get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session && session.user) {
      // Try to find user in our User collection
      let user = await User.findOne({ email: session.user.email }).select("-password");

      if (!user) {
        // Use Better Auth user data
        const betterAuthUser = session.user;
        user = {
          _id: betterAuthUser.id,
          id: betterAuthUser.id,
          name: betterAuthUser.name || betterAuthUser.email?.split('@')[0] || 'User',
          email: betterAuthUser.email,
          phone: betterAuthUser.phone || '',
          role: betterAuthUser.role || 'user',
          image: betterAuthUser.image || '',
          isActive: betterAuthUser.isActive !== false,
          favProperties: betterAuthUser.favProperties || [],
          bookedVisits: betterAuthUser.bookedVisits || [],
          ownedProperties: betterAuthUser.ownedProperties || [],
        };
      }

      if (user.isActive) {
        req.user = user;
        req.session = session;
      }
    }
  } catch (error) {
    // Silently continue without user - this is expected for unauthenticated requests
  }

  next();
};
