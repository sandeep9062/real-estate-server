import express from "express";
import { registerAgent } from "../controllers/agentController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// POST /api/agents/register — Public agent registration with optional photo upload
router.post("/register", upload.single("photo"), registerAgent);

export default router;
