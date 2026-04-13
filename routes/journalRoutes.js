import express from "express";
import {
  createJournal,
  getJournals,
  getJournalById,
  getJournalBySlug,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/")
  .post(protect, checkAdmin, upload.single("coverImage"), createJournal)
  .get(getJournals);
router
  .route("/:id")
  .get(getJournalById)
  .put(protect, checkAdmin, upload.single("coverImage"), updateJournal)
  .delete(protect, checkAdmin, deleteJournal);
router.route("/slug/:slug").get(getJournalBySlug);

export default router;
