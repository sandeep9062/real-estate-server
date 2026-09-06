import express from "express";
import rateLimit from "express-rate-limit";
import {
  createLead,
  getLeads,
  updateLead,
  getLeadStats,
  getAllLeads,
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
// GET is restricted to the property owner's role (agent OR landlord) + admin,
// and the controller scopes results to agentId = req.user._id, so each user only
// ever sees leads for the properties they own.
router
  .route("/")
  .post(leadCreateLimiter, optionalAuth, createLead)
  .get(protect, requireRole(["agent", "landlord", "admin"]), getLeads);

// Admin: all leads across the platform (both WhatsApp-click and brochure leads).
// Declared before /:id routes so it is never captured as an id.
router.get("/admin/all", protect, requireRole(["admin"]), getAllLeads);

// Keep /stats before any /:id route so it is never captured as an id.
router.get(
  "/stats",
  protect,
  requireRole(["agent", "landlord", "admin"]),
  getLeadStats,
);

// Ownership is verified inside the controller (lead.agentId === req.user._id),
// so landlords can only update leads for their own listings.
router.patch(
  "/:id",
  protect,
  requireRole(["agent", "landlord", "admin"]),
  updateLead,
);

export default router;