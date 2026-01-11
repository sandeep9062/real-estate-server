import express from "express";
import {
  generatePropertyDescriptionController,
  generateSeoMetaController,
  generateMatchScoreController,
  generateLocalityGuideController,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/description", generatePropertyDescriptionController);
router.post("/seo-meta", generateSeoMetaController);
router.post("/match-score", generateMatchScoreController);
router.post("/locality-guide", generateLocalityGuideController);

export default router;
