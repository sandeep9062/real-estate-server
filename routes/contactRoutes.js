import express from "express";
import {
  createContact,
  getAllContact,
} from "../controllers/contactController.js";

import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import { validateRecaptcha } from "../middlewares/recaptchaMiddleware.js";

const router = express.Router();

router.post("/", validateRecaptcha, createContact);

router.get("/", protect, checkAdmin, getAllContact);
export default router;
