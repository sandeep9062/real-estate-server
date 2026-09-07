import express from "express";
import {
  registerAgent,
  getAgentByUserId,
  getMyAgentProfile,
  updateMyAgentProfile,
  updateAgentByUserId,
  createAgentByUserId,
} from "../controllers/agentController.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// POST /api/agents/register — Public agent registration with optional photo upload
router.post("/register", upload.single("photo"), registerAgent);

// GET /api/agents/by-user/:userId — Agent profile linked to a user id (admin dashboard)
router.get("/by-user/:userId", protect, checkAdmin, getAgentByUserId);

// POST /api/agents/by-user/:userId — Admin creates an agent profile for a user (role must be "agent")
router.post("/by-user/:userId", protect, checkAdmin, upload.single("photo"), createAgentByUserId);

// PUT /api/agents/by-user/:userId — Admin updates an agent profile by linked user id
router.put("/by-user/:userId", protect, checkAdmin, upload.single("photo"), updateAgentByUserId);

// GET /api/agents/me — Logged-in agent's own profile + profileCompleteness
router.get("/me", protect, getMyAgentProfile);

// PUT /api/agents/me — Logged-in agent updates their own profile (partial)
router.put("/me", protect, upload.single("photo"), updateMyAgentProfile);

export default router;
