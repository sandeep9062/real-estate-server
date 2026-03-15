import express from "express";
import { refresh } from "../auth/auth.controller.js";

const router = express.Router();

/**
 * Refresh Token Routes
 *
 * This route provides a dedicated endpoint for refreshing tokens
 * that can be used by dashboard routes and other protected endpoints
 */

// POST /api/refresh-token - Refresh access token
// This endpoint is designed to be called when the frontend detects
// an ACCESS_TOKEN_EXPIRED error from the dashboard or other protected routes
router.post("/", refresh);

export default router;
