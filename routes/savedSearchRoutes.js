import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  listSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
} from "../controllers/savedSearchController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(listSavedSearches).post(createSavedSearch);
router.route("/:id").patch(updateSavedSearch).delete(deleteSavedSearch);

export default router;
