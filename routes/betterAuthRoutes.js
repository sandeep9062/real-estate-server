import express from "express";
import { auth } from "../config/auth.js";
import { toNodeHandler } from "better-auth/node";
import mongoose from "mongoose";

const router = express.Router();

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
