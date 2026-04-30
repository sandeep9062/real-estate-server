import mongoose from "mongoose";

const visitReviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    agentHelpfulness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    listingAccuracy: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true },
);

visitReviewSchema.index({ property: 1, createdAt: -1 });

const VisitReview = mongoose.model("VisitReview", visitReviewSchema);

export default VisitReview;
