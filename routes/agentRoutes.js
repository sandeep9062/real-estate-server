import express from "express";
import {
  registerAgent,
  getAgentByUserId,
  getMyAgentProfile,
  updateMyAgentProfile,
} from "../controllers/agentController.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// POST /api/agents/register — Public agent registration with optional photo upload
router.post("/register", upload.single("photo"), registerAgent);

// GET /api/agents/by-user/:userId — Agent profile linked to a user id (admin dashboard)
router.get("/by-user/:userId", protect, checkAdmin, getAgentByUserId);

// GET /api/agents/me — Logged-in agent's own profile + profileCompleteness
router.get("/me", protect, getMyAgentProfile);

// PUT /api/agents/me — Logged-in agent updates their own profile (partial)
router.put("/me", protect, upload.single("photo"), updateMyAgentProfile);

export default router;
