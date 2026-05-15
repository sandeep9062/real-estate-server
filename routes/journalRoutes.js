import express from "express";
import {
  createJournal,
  getJournals,
  getJournalById,
  getJournalBySlug,
  getJournalCategories,
  updateJournal,
  deleteJournal,
  getJournalsForSitemap,
} from "../controllers/journalController.js";

import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/sitemap-data", getJournalsForSitemap);
router.get("/categories", getJournalCategories);

router
  .route("/")
  .post(upload.single("coverImage"), createJournal)
  .get(getJournals);
router
  .route("/:id")
  .get(getJournalById)
  .put(upload.single("coverImage"), updateJournal)
  .delete(deleteJournal);
router.route("/slug/:slug").get(getJournalBySlug);

export default router;
