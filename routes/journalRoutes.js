import express from "express";
import rateLimit from "express-rate-limit";
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
  trackJournalView,
} from "../controllers/journalController.js";

import upload from "../middlewares/multer.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Conservative guard on the public view counter: 30 views/min/IP.
// Safe because app.js sets trust proxy to 1, so req.ip is the real client
// IP behind the Render proxy (without that, all visitors would share one
// IP and throttle each other). Only successful increments count, and the
// limiter never changes the response shape -- it returns the standard
// express-rate-limit 429 JSON only when the budget is exceeded.
const journalViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/sitemap-data", getJournalsForSitemap);
router.get("/categories", getJournalCategories);
router.get("/all", protect, checkAdmin, getAllJournals);

// Admin-only: create journal
router
  .route("/")
  .post(protect, checkAdmin, upload.single("coverImage"), createJournal)
  .get(getJournals);

// Public: view single journal by slug (SEO-friendly URLs)
router.route("/slug/:slug").get(getJournalBySlug);

// Public: count a view when the journal detail page is opened
router.route("/:slug/view").post(journalViewLimiter, trackJournalView);

// Admin-only: view/update/delete a single journal by ID.
// Placed LAST so the more specific /slug/:slug and /:slug/view routes above
// are matched first (Express matches in declaration order).
router
  .route("/:id")
  .get(protect, checkAdmin, getJournalById)
  .put(protect, checkAdmin, upload.single("coverImage"), updateJournal)
  .delete(protect, checkAdmin, deleteJournal);

export default router;
