import { auth } from "../config/auth.js";
import User from "../models/User.js";
import mongoose from "mongoose";

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
    let session = null;
    
    // First, try to get session from Bearer token (for cross-origin requests)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Directly query the session from the database
        // Better Auth stores sessions in the 'sessions' collection
        const db = mongoose.connection.db;
        
        // Try to find session by token (Better Auth stores it in 'token' field)
        let sessionDoc = await db.collection('sessions').findOne({ token });
        
        // If not found, try with sessionToken field (alternative field name)
        if (!sessionDoc) {
          sessionDoc = await db.collection('sessions').findOne({ sessionToken: token });
        }
        
        // Debug: log what we found
        if (!sessionDoc) {
          console.log("No session found for token:", token.substring(0, 10) + "...");
          // List all sessions for debugging (remove in production)
          const allSessions = await db.collection('sessions').find({}).toArray();
          console.log("Total sessions in DB:", allSessions.length);
        }
        
        if (sessionDoc) {
          // Check if session is expired
          if (sessionDoc.expiresAt && new Date(sessionDoc.expiresAt) < new Date()) {
            console.log("Session expired");
          } else {
            // Get the user associated with this session
            const userDoc = await db.collection('users').findOne({ 
              _id: new mongoose.Types.ObjectId(sessionDoc.userId) 
            });
            
            if (userDoc) {
              session = {
                user: userDoc,
                session: sessionDoc
              };
            }
          }
        }
      } catch (tokenError) {
        console.log("Bearer token validation failed:", tokenError.message);
      }
    }
    
    // If no session from Bearer token, try cookie-based session
    if (!session || !session.user) {
      try {
        session = await auth.api.getSession({
          headers: req.headers,
        });
      } catch (cookieError) {
        console.log("Cookie session validation failed:", cookieError.message);
      }
    }

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
    let session = null;
    
    // First, try to get session from Bearer token (for cross-origin requests)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Directly query the session from the database
        const db = mongoose.connection.db;
        const sessionDoc = await db.collection('sessions').findOne({ token });
        
        if (sessionDoc) {
          // Check if session is expired
          if (!sessionDoc.expiresAt || new Date(sessionDoc.expiresAt) >= new Date()) {
            // Get the user associated with this session
            const userDoc = await db.collection('users').findOne({ 
              _id: new mongoose.Types.ObjectId(sessionDoc.userId) 
            });
            
            if (userDoc) {
              session = {
                user: userDoc,
                session: sessionDoc
              };
            }
          }
        }
      } catch (tokenError) {
        // Silently continue
      }
    }
    
    // If no session from Bearer token, try cookie-based session
    if (!session || !session.user) {
      try {
        session = await auth.api.getSession({
          headers: req.headers,
        });
      } catch (cookieError) {
        // Silently continue
      }
    }

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
