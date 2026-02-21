import express from "express";
import { auth } from "../config/auth.js";
import { toNodeHandler } from "better-auth/node";

const router = express.Router();

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
