import express from "express";
const router = express.Router();
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOwnedProperties,
} from "../controllers/propertyController.js";

import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

router
  .route("/")
  .get(getProperties)
  .post(protect, upload.array("image", 12), createProperty);
router.get("/owned", protect, getOwnedProperties);
router
  .route("/:id")
  .get(getPropertyById)
  .put(protect, upload.array("image", 12), updateProperty)
  .delete(protect, deleteProperty);

export default router;
