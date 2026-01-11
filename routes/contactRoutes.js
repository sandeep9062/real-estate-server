import express from "express";
import {
  createContact,
  getAllContact,
} from "../controllers/contactController.js";

import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", createContact);

router.get("/", protect, checkAdmin, getAllContact);
export default router;
