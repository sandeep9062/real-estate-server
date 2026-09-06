import express from "express";
const router = express.Router();

import {
  adminCreateProperty,
  adminUpdateProperty,
} from "../controllers/adminPropertyController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

// Same upload contract as the public property routes
const propertyUpload = upload.fields([
  { name: "image", maxCount: 25 },
  { name: "floorPlan", maxCount: 15 },
]);

// Everything here is admin-only
router.use(protect, requireAdmin);

// POST /api/admin/properties — full-field property creation
router.route("/").post(propertyUpload, adminCreateProperty);

// PUT /api/admin/properties/:id — full-field property update
router.route("/:id").put(propertyUpload, adminUpdateProperty);

export default router;
