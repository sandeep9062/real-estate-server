import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import VisitReview from "../models/VisitReview.js";

/** Booking.date stored as DD/MM/YYYY from frontend */
function parseBookingDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function isVisitDayEligible(booking) {
  const visit = parseBookingDate(booking.date);
  if (!visit) return false;
  visit.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return visit.getTime() <= today.getTime();
}

export const getBookingReviewStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not allowed" });
  }
  const rev = await VisitReview.findOne({ booking: bookingId }).select("_id").lean();
  res.json({
    reviewed: !!rev,
    eligible:
      booking.status === "Completed" || isVisitDayEligible(booking),
  });
});

export const submitVisitReview = asyncHandler(async (req, res) => {
  const { bookingId, agentHelpfulness, listingAccuracy, comment } = req.body;

  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }

  const ah = Number(agentHelpfulness);
  const la = Number(listingAccuracy);
  if (Number.isNaN(ah) || ah < 1 || ah > 5 || Number.isNaN(la) || la < 1 || la > 5) {
    return res.status(400).json({
      message: "agentHelpfulness and listingAccuracy must be 1–5",
    });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not your booking" });
  }

  if (booking.status === "Cancelled") {
    return res.status(400).json({ message: "Cannot review a cancelled visit" });
  }

  if (
    booking.status !== "Completed" &&
    !isVisitDayEligible(booking)
  ) {
    return res.status(400).json({
      message: "You can leave a review after your scheduled visit date",
    });
  }

  const existing = await VisitReview.findOne({ booking: bookingId });
  if (existing) {
    return res.status(400).json({ message: "You already submitted a review for this visit" });
  }

  const review = await VisitReview.create({
    booking: bookingId,
    user: req.user._id,
    property: booking.property,
    agentHelpfulness: ah,
    listingAccuracy: la,
    comment: typeof comment === "string" ? comment.slice(0, 500) : "",
  });

  res.status(201).json(review);
});

export const getPropertyVisitReviewSummary = asyncHandler(async (req, res) => {
  const { id: propertyId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ message: "Invalid property id" });
  }

  const agg = await VisitReview.aggregate([
    { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgAgentHelpfulness: { $avg: "$agentHelpfulness" },
        avgListingAccuracy: { $avg: "$listingAccuracy" },
      },
    },
  ]);

  const row = agg[0];
  if (!row) {
    return res.json({
      count: 0,
      avgAgentHelpfulness: null,
      avgListingAccuracy: null,
    });
  }

  res.json({
    count: row.count,
    avgAgentHelpfulness: Math.round(row.avgAgentHelpfulness * 10) / 10,
    avgListingAccuracy: Math.round(row.avgListingAccuracy * 10) / 10,
  });
});

export const getPropertyVisitReviews = asyncHandler(async (req, res) => {
  const { id: propertyId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ message: "Invalid property id" });
  }

  const limit = Math.min(Number(req.query.limit) || 10, 25);

  const list = await VisitReview.find({ property: propertyId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("agentHelpfulness listingAccuracy comment createdAt")
    .lean();

  const sanitized = list.map((r) => ({
    id: r._id.toString(),
    agentHelpfulness: r.agentHelpfulness,
    listingAccuracy: r.listingAccuracy,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewerLabel: "Verified visitor",
  }));

  res.json(sanitized);
});
