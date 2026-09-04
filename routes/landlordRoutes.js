import express from "express";
import {
  registerLandlord,
  getLandlords,
  getLandlordById,
  getMyLandlordProfile,
  updateLandlord,
  deleteLandlord,
  uploadDocument,
  verifyDocument,
  verifyLandlord,
  updateBankDetails,
  toggleFeatured,
  updateStatus,
} from "../controllers/landlordController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Public routes
router.post("/register", upload.single("photo"), registerLandlord);
router.get("/", getLandlords);

// Protected route — MUST be declared before /:identifier so "me" isn't
// captured as an identifier.
router.get("/me", protect, getMyLandlordProfile);

router.get("/:identifier", getLandlordById);

// Protected routes (profile management)
router.put("/:id", upload.single("photo"), updateLandlord);
router.post("/:id/documents", upload.single("document"), uploadDocument);

// Admin routes
router.patch("/:id/verify", verifyLandlord);
router.patch("/:id/documents/:docId/verify", verifyDocument);
router.put("/:id/bank-details", updateBankDetails);
router.patch("/:id/featured", toggleFeatured);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteLandlord);

export default router;
