import express from "express";
import {
  createContact,
  getAllContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import { validateRecaptcha } from "../middlewares/recaptchaMiddleware.js";

const router = express.Router();

router.post("/", validateRecaptcha, createContact);

router.get("/", protect, checkAdmin, getAllContact);

// Admin-only management endpoints
router.put("/:id", protect, checkAdmin, updateContact);
router.delete("/:id", protect, checkAdmin, deleteContact);

export default router;
