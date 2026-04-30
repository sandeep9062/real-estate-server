import express from "express";
const router = express.Router();
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOwnedProperties,
  getPropertyBrochure,
  createWhatsAppLead,
  getCompareProperties,
  getSimilarProperties,
  recordPropertyView,
} from "../controllers/propertyController.js";

import {
  getPropertyVisitReviewSummary,
  getPropertyVisitReviews,
} from "../controllers/visitReviewController.js";

import { protect, optionalAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const propertyUpload = upload.fields([
  { name: "image", maxCount: 25 },
  { name: "floorPlan", maxCount: 15 },
]);

router
  .route("/")
  .get(getProperties)
  .post(protect, propertyUpload, createProperty);

router.get("/compare", getCompareProperties);
router.get("/similar", getSimilarProperties);
router.get("/owned", protect, getOwnedProperties);

router.get("/:id/visit-reviews/summary", getPropertyVisitReviewSummary);
router.get("/:id/visit-reviews", getPropertyVisitReviews);

router.post("/:id/view", optionalAuth, recordPropertyView);

router
  .route("/:id")
  .get(getPropertyById)
  .put(protect, propertyUpload, updateProperty)
  .delete(protect, deleteProperty);

router.get("/:id/download-brochure", getPropertyBrochure);
router.post("/:id/whatsapp-lead", protect, createWhatsAppLead);

export default router;
