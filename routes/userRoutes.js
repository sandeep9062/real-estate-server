import express from "express";

import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  bookVisit,
  cancelVisit,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  toggleFavourite,
  updateProfile,
  updateUser,
  userBookings,
  userFavourites,
  userProfile,
} from "../controllers/userController.js";

const router = express.Router();
// login and register is part of authRoutes

// ✅ Profile Update Route (with image upload)
router.put("/profile-update", protect, upload.single("image"), updateProfile);

// ✅ Get logged-in user's profile
router.get("/profile", userProfile);

// ✅ Get all favourite properties of a user
router.get("/favourites", protect, userFavourites);

// ✅ Get all bookings of a user
router.get("/bookings", protect, userBookings);

// ✅ Get user by ID
router.get("/:id", getUser);

// ✅ Create a new user
router.post("/", createUser);

// ✅ Get all users
router.get("/", protect, checkAdmin, getUsers);

// ✅ Update user by ID
router.put("/:id", protect, updateUser);

// ✅ Add/Remove Favourite Route
router.post("/toFav/:propId", protect, toggleFavourite);

// ✅ Book a property visit
router.post("/bookings", protect, bookVisit);

// ✅ Cancel a property visit
router.delete("/bookings/:propertyId", protect, cancelVisit);

// ✅ Delete user by ID
router.delete("/:id", protect, checkAdmin, deleteUser);

export default router;
