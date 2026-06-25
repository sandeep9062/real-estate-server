import express from "express";
import {
  createRoommate,
  getRoommates,
  getRoommateById,
  getRoommateBySlug,
  updateRoommate,
  deleteRoommate,
  updateRoommateStatus,
  toggleRoommateVerified,
} from "../controllers/roommateController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getRoommates);
router.get("/slug/:slug", getRoommateBySlug);
router.get("/:id", getRoommateById);

// Protected routes
router.post("/", protect, createRoommate);
router.put("/:id", protect, updateRoommate);
router.delete("/:id", protect, deleteRoommate);
router.patch("/:id/status", protect, updateRoommateStatus);

// Admin-only routes
router.patch("/:id/verify", protect, toggleRoommateVerified);

export default router;
