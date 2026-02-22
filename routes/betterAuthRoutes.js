import express from "express";
import { auth } from "../config/auth.js";
import { toNodeHandler } from "better-auth/node";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Custom login endpoint for cross-origin clients
// This endpoint returns the session token directly in the response body
router.post("/custom-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user in Better Auth's users collection
    const db = mongoose.connection.db;
    const userDoc = await db.collection('users').findOne({ email });

    if (!userDoc) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    let isValidPassword = false;
    
    // Check if user has password in Better Auth format
    if (userDoc.password) {
      // Check if it's a hashed password
      if (userDoc.password.startsWith('$2')) {
        isValidPassword = await bcrypt.compare(password, userDoc.password);
      } else {
        // Plain text comparison (shouldn't happen but just in case)
        isValidPassword = password === userDoc.password;
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (userDoc.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Create a new session
    const sessionToken = new mongoose.Types.ObjectId().toString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const sessionDoc = {
      _id: new mongoose.Types.ObjectId(),
      id: sessionToken,
      token: sessionToken,
      userId: userDoc._id.toString(),
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('sessions').insertOne(sessionDoc);

    // Return user and token
    return res.json({
      success: true,
      token: sessionToken,
      user: {
        _id: userDoc._id,
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        image: userDoc.image || null,
        phone: userDoc.phone || null,
        role: userDoc.role || "user",
        favProperties: userDoc.favProperties || [],
        bookedVisits: userDoc.bookedVisits || [],
        ownedProperties: userDoc.ownedProperties || [],
      },
    });
  } catch (error) {
    console.error("Custom login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// Custom signup endpoint for cross-origin clients
router.post("/custom-signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const db = mongoose.connection.db;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = new mongoose.Types.ObjectId();
    const userDoc = {
      _id: userId,
      id: userId.toString(),
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: "user",
      isActive: true,
      image: null,
      favProperties: [],
      bookedVisits: [],
      ownedProperties: [],
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').insertOne(userDoc);

    // Create session
    const sessionToken = new mongoose.Types.ObjectId().toString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const sessionDoc = {
      _id: new mongoose.Types.ObjectId(),
      id: sessionToken,
      token: sessionToken,
      userId: userId.toString(),
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('sessions').insertOne(sessionDoc);

    // Return user and token
    return res.json({
      success: true,
      token: sessionToken,
      user: {
        _id: userId,
        id: userId.toString(),
        name,
        email,
        image: null,
        phone: phone || null,
        role: "user",
        favProperties: [],
        bookedVisits: [],
        ownedProperties: [],
      },
    });
  } catch (error) {
    console.error("Custom signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});

// Custom endpoint to get session token for cross-origin clients
// This endpoint returns the session token from the database
router.get("/get-token", async (req, res) => {
  try {
    // First try to get session from cookies
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session?.session?.token) {
      return res.json({
        success: true,
        token: session.session.token,
        user: session.user,
      });
    }

    // If no session from cookies, check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const db = mongoose.connection.db;
      const sessionDoc = await db.collection('sessions').findOne({ token });
      
      if (sessionDoc && (!sessionDoc.expiresAt || new Date(sessionDoc.expiresAt) >= new Date())) {
        const userDoc = await db.collection('users').findOne({ 
          _id: new mongoose.Types.ObjectId(sessionDoc.userId) 
        });
        
        if (userDoc) {
          return res.json({
            success: true,
            token: sessionDoc.token,
            user: userDoc,
          });
        }
      }
    }

    return res.status(401).json({ 
      success: false, 
      message: "No active session found" 
    });
  } catch (error) {
    console.error("Get token error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Failed to get session token" 
    });
  }
});

// Logout endpoint - deletes session from database
router.post("/custom-logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const db = mongoose.connection.db;
      await db.collection('sessions').deleteOne({ token });
    }
    
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
});

// Better-auth handler for all auth routes
// Using middleware pattern to handle all routes for better-auth
const handler = toNodeHandler(auth);

// Handle all HTTP methods for root path
router.get("/", handler);
router.post("/", handler);
router.put("/", handler);
router.delete("/", handler);
router.patch("/", handler);

// Handle single-level paths (e.g., /session, /sign-out)
router.get("/:path", handler);
router.post("/:path", handler);
router.put("/:path", handler);
router.delete("/:path", handler);
router.patch("/:path", handler);

// Handle two-level paths (e.g., /sign-in/social, /sign-in/email)
router.get("/:path/:subpath", handler);
router.post("/:path/:subpath", handler);
router.put("/:path/:subpath", handler);
router.delete("/:path/:subpath", handler);
router.patch("/:path/:subpath", handler);

// Handle three-level paths (e.g., /sign-in/oauth2/callback)
router.get("/:path/:subpath/:action", handler);
router.post("/:path/:subpath/:action", handler);
router.put("/:path/:subpath/:action", handler);
router.delete("/:path/:subpath/:action", handler);
router.patch("/:path/:subpath/:action", handler);

export default router;
