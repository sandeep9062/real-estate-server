import express from "express";
import { registerAgent, getMyAgentProfile } from "../controllers/agentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// POST /api/agents/register — Public agent registration with optional photo upload
router.post("/register", upload.single("photo"), registerAgent);

// GET /api/agents/me — Logged-in agent's own profile + profileCompleteness
router.get("/me", protect, getMyAgentProfile);

export default router;
