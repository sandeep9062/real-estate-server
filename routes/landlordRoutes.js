import express from "express";
import {
  registerLandlord,
  getLandlords,
  getLandlordById,
  getLandlordByUserId,
  createLandlordByUserId,
  getMyLandlordProfile,
  updateMyLandlordProfile,
  updateLandlord,
  deleteLandlord,
  uploadDocument,
  verifyDocument,
  verifyLandlord,
  updateBankDetails,
  toggleFeatured,
  updateStatus,
} from "../controllers/landlordController.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Public routes
router.post("/register", upload.single("photo"), registerLandlord);
router.get("/", getLandlords);

// Protected routes — MUST be declared before /:identifier so "me" isn't
// captured as an identifier.
router.get("/me", protect, getMyLandlordProfile);
router.put("/me", protect, upload.single("photo"), updateMyLandlordProfile);

// GET /api/landlords/by-user/:userId — Landlord profile linked to a user id (admin dashboard)
router.get("/by-user/:userId", protect, checkAdmin, getLandlordByUserId);

// POST /api/landlords/by-user/:userId — Admin creates a landlord profile for a user (role must be "landlord")
router.post("/by-user/:userId", protect, checkAdmin, upload.single("photo"), createLandlordByUserId);

router.get("/:identifier", getLandlordById);

// Protected routes (profile management)
router.put("/:id", protect, upload.single("photo"), updateLandlord);
router.post("/:id/documents", protect, upload.single("document"), uploadDocument);

// Admin routes
router.patch("/:id/verify", protect, verifyLandlord);
router.patch("/:id/documents/:docId/verify", protect, verifyDocument);
router.put("/:id/bank-details", protect, updateBankDetails);
router.patch("/:id/featured", protect, toggleFeatured);
router.patch("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteLandlord);

export default router;
