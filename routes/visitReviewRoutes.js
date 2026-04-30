import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { submitVisitReview, getBookingReviewStatus } from "../controllers/visitReviewController.js";

const router = express.Router();

router.get("/booking/:bookingId/status", protect, getBookingReviewStatus);
router.post("/", protect, submitVisitReview);

export default router;
