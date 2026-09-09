import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // adjust to your actual auth middleware path/name
import { restrictToResidents } from "../middleware/restrictToResidents.js";

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

const router = express.Router();

// ---- Profile ----
// Creation/document-upload are resident-only (no agents/builders).
// Reading/searching is open to any authenticated user.
router.post("/profile", protect, restrictToResidents, createProfile);
router.patch("/profile", protect, restrictToResidents, updateProfile);
router.get("/profile/me", protect, getOwnProfile);
router.get("/profile/:id", protect, getPublicProfile);
router.post("/profile/documents", protect, restrictToResidents, uploadDocument);
router.get("/seekers", protect, searchSeekers);

// ---- Room/Flat ----
router.post("/room-flat", protect, restrictToResidents, createRoomFlat);
router.patch("/room-flat/:id", protect, restrictToResidents, updateRoomFlat);
router.get("/browse", protect, browseRoomsAndFlats);
router.get("/swap-matches", protect, searchSwapMatches);

// ---- Connections ----
router.post("/connections", protect, sendConnectionRequest);
router.patch("/connections/:id", protect, respondToConnectionRequest);
router.get("/connections", protect, listMyConnections);

export default router;
