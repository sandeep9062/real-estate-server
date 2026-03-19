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
} from "../controllers/propertyController.js";

import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

router
  .route("/")
  .get(getProperties)
  .post(protect, upload.array("image", 25), createProperty);
router.get("/owned", protect, getOwnedProperties);
router
  .route("/:id")
  .get(getPropertyById)
  .put(protect, upload.array("image", 25), updateProperty)
  .delete(protect, deleteProperty);

router.get("/:id/download-brochure", getPropertyBrochure);

export default router;
