import express from "express";
import {
  createJournal,
  getJournals,
  getAllJournals,
  getJournalById,
  getJournalBySlug,
  getJournalCategories,
  updateJournal,
  deleteJournal,
  getJournalsForSitemap,
} from "../controllers/journalController.js";

import upload from "../middlewares/multer.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/sitemap-data", getJournalsForSitemap);
router.get("/categories", getJournalCategories);
router.get("/all", protect, checkAdmin, getAllJournals);

// Admin-only: create journal
router
  .route("/")
  .post(protect, checkAdmin, upload.single("coverImage"), createJournal)
  .get(getJournals);

// Public: view single journal by ID
// Admin-only: update and delete
router
  .route("/:id")
  .get(getJournalById)
  .put(protect, checkAdmin, upload.single("coverImage"), updateJournal)
  .delete(protect, checkAdmin, deleteJournal);

router.route("/slug/:slug").get(getJournalBySlug);

export default router;
