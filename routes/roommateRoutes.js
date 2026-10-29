import express from "express";
import { protect, optionalAuth } from "../middlewares/authMiddleware.js"; // adjust to your actual auth middleware path/name
import { restrictToResidents } from "../middlewares/restrictToResidents.js"; // adjust to your actual middleware path/name
import upload from "../middlewares/multer.js"; // multer-cloudinary for photo/video uploads

import {
  createProfile,
  updateProfile,
  getOwnProfile,
  getPublicProfile,
  uploadDocument,
  searchSeekers,
} from "../controllers/roommateProfileController.js";

import {
  createRoomFlat,
  updateRoomFlat,
  browseRoomsAndFlats,
  searchSwapMatches,
} from "../controllers/roomFlatController.js";

import {
  sendConnectionRequest,
  respondToConnectionRequest,
  listMyConnections,
} from "../controllers/flatmateConnectionController.js";

import { toggleFavRoommate } from "../controllers/userController.js";

const router = express.Router();

// ---- Profile ----
// Creation/document-upload are resident-only (no agents/builders).
// Reading/searching is open to any authenticated user.
router.post(
  "/profile",
  protect,
  restrictToResidents,
  upload.array("photos"),
  createProfile,
);
router.patch(
  "/profile",
  protect,
  restrictToResidents,
  upload.array("photos"),
  updateProfile,
);
router.get("/profile/me", protect, getOwnProfile);
router.get("/profile/:id", optionalAuth, getPublicProfile);
router.post("/profile/documents", protect, restrictToResidents, uploadDocument);
router.get("/seekers", optionalAuth, searchSeekers);

// ---- Room/Flat ----
// upload.array("photos") accepts new photo/video uploads (Cloudinary via
// multer) and is a no-op for plain JSON requests without files.
router.post(
  "/room-flat",
  protect,
  restrictToResidents,
  upload.array("photos"),
  createRoomFlat,
);
router.patch(
  "/room-flat/:id",
  protect,
  restrictToResidents,
  upload.array("photos"),
  updateRoomFlat,
);
router.get("/browse", browseRoomsAndFlats);
router.get("/swap-matches", protect, searchSwapMatches);

// ---- Connections ----
router.post("/connections", protect, sendConnectionRequest);
router.patch("/connections/:id", protect, respondToConnectionRequest);
router.get("/connections", optionalAuth, listMyConnections);

// ---- Favourite Roommate Profiles ----
router.post("/favourite/:profileId", protect, toggleFavRoommate);

export default router;
