
// src/routes/websiteImageRoutes.js
import express from "express";
import upload from "../middlewares/multer.js"; // your multer-cloudinary middleware
import {
  uploadImage,
  getImages,
  updateImage,
  deleteImage,
} from "../controllers/websiteImageController.js";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Upload new image
router.post("/", protect, checkAdmin, upload.single("image"), uploadImage);

// Get all images
router.get("/", getImages);

// Update image (with optional file change)
router.put("/:id", protect, checkAdmin, upload.single("image"), updateImage);

// Delete image
router.delete("/:id", protect, checkAdmin, deleteImage);

export default router;
