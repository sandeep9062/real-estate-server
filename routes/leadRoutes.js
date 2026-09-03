import express from "express";
import rateLimit from "express-rate-limit";
import {
  createLead,
  getLeads,
  updateLead,
  getLeadStats,
} from "../controllers/leadController.js";
import {
  protect,
  optionalAuth,
  requireRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Modest guard against click spam from anonymous visitors on listing pages.
const leadCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 lead creations per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many lead requests. Please try again later.",
    code: "RATE_LIMITED",
  },
});

// Public + optionalAuth: the WhatsApp click fires from a public listing page.
// agentId is derived server-side from the property's owner inside the controller.
router
  .route("/")
  .post(leadCreateLimiter, optionalAuth, createLead)
  .get(protect, requireRole(["agent", "admin"]), getLeads);

// Keep /stats before any /:id route so it is never captured as an id.
router.get("/stats", protect, requireRole(["agent", "admin"]), getLeadStats);

router.patch("/:id", protect, requireRole(["agent", "admin"]), updateLead);

export default router;