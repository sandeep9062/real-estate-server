import express from "express";
import rateLimit from "express-rate-limit";
import {
  createJournal,
  getJournals,
  getAllJournals,
  getJournalById,
  getJournalByIdAdmin,
  getJournalBySlug,
  getJournalCategories,
  updateJournal,
  deleteJournal,
  getJournalsForSitemap,
  trackJournalView,
} from "../controllers/journalController.js";

import upload from "../middlewares/multer.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Conservative guard on the public view counter: 30 views/min/IP.
const journalViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const journalUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "authorAvatar", maxCount: 1 },
]);

// Static routes first so they are never swallowed by "/:id".
router.get("/sitemap-data", getJournalsForSitemap);
router.get("/categories", getJournalCategories);
router.get("/all", protect, checkAdmin, getAllJournals);

// FIX: admin edit form needs to load ANY journal (including inactive ones).
// The public "/:id" only returns active journals, so editing a deactivated
// journal failed with 404 ("This journal couldn't be loaded").
router.get("/admin/:id", protect, checkAdmin, getJournalByIdAdmin);

// Public: view by slug
router.get("/slug/:slug", getJournalBySlug);

// Admin-only: create journal / Public: list
router
  .route("/")
  .post(protect, checkAdmin, journalUpload, createJournal)
  .get(getJournals);

// Public: count a view when the journal detail page is opened
router.post("/:slug/view", journalViewLimiter, trackJournalView);

// Public: view single journal by ID / Admin-only: update and delete
router
  .route("/:id")
  .get(getJournalById)
  .put(protect, checkAdmin, journalUpload, updateJournal)
  .delete(protect, checkAdmin, deleteJournal);

export default router;
