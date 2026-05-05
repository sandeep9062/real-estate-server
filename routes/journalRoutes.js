import express from "express";
import {
  createJournal,
  getJournals,
  getJournalById,
  getJournalBySlug,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";

import upload from "../middlewares/multer.js";

const router = express.Router();

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
