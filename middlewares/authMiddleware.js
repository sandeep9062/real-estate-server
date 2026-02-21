import User from "../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Helper to verify Better Auth session token from the database
const verifyBetterAuthSession = async (token) => {
  try {
    // Connect to the session collection directly
    const db = mongoose.connection.db;
    const sessionCollection = db.collection("session");
    
    console.log("Session: Looking for token:", token?.substring(0, 20) + "...");
    
    // First, let's see what sessions exist
    const allSessions = await sessionCollection.find({}).toArray();
    console.log("Session: Total sessions in DB:", allSessions.length);
    
    if (allSessions.length > 0) {
      console.log("Session: Sample session fields:", Object.keys(allSessions[0]));
    }
    
    // Find the session by token (try multiple field names that Better Auth might use)
    let session = await sessionCollection.findOne({ token });
    console.log("Session: Found by 'token' field:", !!session);
    
    // Also try finding by the session ID if token lookup fails
    if (!session) {
      session = await sessionCollection.findOne({ id: token });
      console.log("Session: Found by 'id' field:", !!session);
    }
    
    // Try finding by sessionToken field
    if (!session) {
      session = await sessionCollection.findOne({ sessionToken: token });
      console.log("Session: Found by 'sessionToken' field:", !!session);
    }
    
    // Also try finding by _id if it's a valid ObjectId
    if (!session && mongoose.Types.ObjectId.isValid(token)) {
      try {
        session = await sessionCollection.findOne({ _id: new mongoose.Types.ObjectId(token) });
        console.log("Session: Found by '_id' field:", !!session);
      } catch (e) {
        // Ignore ObjectId conversion errors
      }
    }
    
    // If still not found, try to find any session and check if token matches
    // This handles cases where the token format might be different
    if (!session && allSessions.length > 0) {
      for (const s of allSessions) {
        // Check all possible token fields
        if (s.token === token || s.sessionToken === token || s.id === token) {
          session = s;
          console.log("Session: Found by iterating all sessions");
          break;
        }
      }
    }
    
    if (!session) {
      console.log("Session: Not found for token");
      return null;
    }
    
    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      console.log("Session: Expired at:", session.expiresAt);
      return null;
    }
    
    console.log("Session: Valid session found for userId:", session.userId);
    return session;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
};

// Helper to find or create user from Better Auth
const findOrCreateUserFromBetterAuth = async (session) => {
  try {
    const db = mongoose.connection.db;
    // Better Auth is configured with modelName: "users" (plural)
    const userCollection = db.collection("users");
    
    // The userId from session might be an ObjectId or a string
    // Handle both cases
    let userIdValue = session.userId;
    if (userIdValue && typeof userIdValue === 'object' && userIdValue.toString) {
      userIdValue = userIdValue.toString();
    }
    
    console.log("BetterAuth: Looking for user with id:", userIdValue);
    
    // Find the Better Auth user - try multiple lookup methods
    // First try by id field (string ID that Better Auth generates)
    let betterAuthUser = await userCollection.findOne({ id: userIdValue });
    
    // Also try by _id if it's a valid ObjectId
    if (!betterAuthUser && mongoose.Types.ObjectId.isValid(userIdValue)) {
      betterAuthUser = await userCollection.findOne({ 
        _id: new mongoose.Types.ObjectId(userIdValue) 
      });
    }
    
    // Also try with the original ObjectId directly
    if (!betterAuthUser && session.userId) {
      // If session.userId is already an ObjectId, use it directly
      if (session.userId._bsontype === 'ObjectId' || mongoose.Types.ObjectId.isValid(session.userId)) {
        const objectIdValue = typeof session.userId === 'string' 
          ? new mongoose.Types.ObjectId(session.userId) 
          : session.userId;
        betterAuthUser = await userCollection.findOne({ _id: objectIdValue });
        if (!betterAuthUser) {
          // Also try finding by id as string
          betterAuthUser = await userCollection.findOne({ id: session.userId.toString() });
        }
      } else {
        betterAuthUser = await userCollection.findOne({ id: session.userId });
      }
    }
    
    console.log("BetterAuth: User found:", !!betterAuthUser);
    
    if (!betterAuthUser) {
      console.log("BetterAuth: No user found in Better Auth collection");
      return null;
    }
    
    // Try to find existing user in our User collection by email
    let user = await User.findOne({ email: betterAuthUser.email });
    
    if (!user) {
      // Instead of creating a duplicate in User collection, return a user-like object
      // from Better Auth data. This avoids password validation issues.
      // The Better Auth users collection is the source of truth for these users.
      return {
        _id: betterAuthUser._id,
        id: betterAuthUser.id || betterAuthUser._id?.toString(),
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
        // Add method stubs for compatibility
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
    } else {
      // Update existing user with Better Auth data if needed
      if (betterAuthUser.role && user.role !== betterAuthUser.role) {
        user.role = betterAuthUser.role;
      }
      if (betterAuthUser.phone && !user.phone) {
        user.phone = betterAuthUser.phone;
      }
      if (betterAuthUser.image && !user.image) {
        user.image = betterAuthUser.image;
      }
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error("Error finding/creating user from Better Auth:", error);
    return null;
  }
};

// Middleware to protect routes - verifies tokens from the frontend
export const protect = async (req, res, next) => {
  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      console.log("Auth: No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    console.log("Auth: Received token:", token.substring(0, 30) + "...");

    try {
      // First, try to verify as JWT token
      if (token.split('.').length === 3) {
        console.log("Auth: Trying JWT verification...");
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id || decoded.sub;

          if (userId) {
            const user = await User.findById(userId).select("-password");

            if (user && user.isActive) {
              console.log("Auth: JWT verification successful for user:", user.email);
              req.user = user;
              req.token = token;
              return next();
            }
          }
        } catch (jwtError) {
          console.log("Auth: JWT verification failed:", jwtError.message);
          // Not a valid JWT, continue to try Better Auth
        }
      }
      
      // Try to verify as Better Auth session token
      console.log("Auth: Trying Better Auth session verification...");
      const session = await verifyBetterAuthSession(token);
      
      if (session) {
        console.log("Auth: Session found, userId:", session.userId);
        // Find or create user from Better Auth
        const user = await findOrCreateUserFromBetterAuth(session);
        
        if (user && user.isActive) {
          console.log("Auth: Better Auth verification successful for user:", user.email);
          req.user = user;
          req.token = token;
          req.session = session;
          return next();
        } else {
          console.log("Auth: User not found or inactive");
        }
      }
      
      console.log("Auth: All verification methods failed");
      return res.status(401).json({ message: "Invalid or expired token" });
    } catch (error) {
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  console.log("Auth: No Authorization header");
  return res.status(401).json({ message: "No token provided" });
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
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    
    if (token) {
      try {
        // Try JWT first
        if (token.split('.').length === 3) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id || decoded.sub;
            const user = await User.findById(userId).select("-password");
            if (user && user.isActive) {
              req.user = user;
              req.token = token;
              return next();
            }
          } catch (jwtError) {
            // Not a valid JWT, continue to try Better Auth
          }
        }
        
        // Try Better Auth session
        const session = await verifyBetterAuthSession(token);
        if (session) {
          const user = await findOrCreateUserFromBetterAuth(session);
          if (user && user.isActive) {
            req.user = user;
            req.token = token;
            req.session = session;
          }
        }
      } catch (error) {
        // Silently continue without user
      }
    }
  }
  
  next();
};