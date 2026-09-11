import mongoose from "mongoose";

/**
 * RoomFlat
 *
 * The physical-property record for the flatmate feature. Only created
 * when the associated RoommateProfile's type is "have_room" — profiles
 * that are just searching (type "no_room") never get one of these.
 *
 * RoomFlat is the collection you run geo queries against for public
 * browse/search.
 */

// Reuse the exact location shape used on Property.js so geo-query patterns
// stay consistent across both collections. Import from Property.js if it's
// exported there (`export { locationSchema }`) rather than redefining it —
// shown inline here for portability.
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true },
  city: { type: String, index: true, trim: true },
  sector: { type: String, index: true, trim: true },
  state: { type: String, index: true, trim: true },
  country: { type: String, trim: true },
  slug: { type: String, unique: true, sparse: true, trim: true },
  pincode: { type: String, trim: true },
  landmark: { type: String, trim: true },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
});

locationSchema.index({ coordinates: "2dsphere" });

const roomFlatSchema = new mongoose.Schema(
  {
    roommateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoommateProfile",
      required: true,
      index: true,
    },
    // Denormalized for quick ownership checks in middleware without a
    // populate + lookup on every request.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    openToTemporaryStay: {
      type: Boolean,
      default: false,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    location: locationSchema,

    rentAmount: { type: Number, min: 0, required: true },
    securityDeposit: { type: Number, min: 0 },

    roomType: {
      type: String,
      enum: ["private_room", "shared_room", "entire_flat"],
      required: true,
    },

    furnishing: {
      type: String,
      enum: ["furnished", "semi_furnished", "unfurnished"],
    },

    availableFrom: Date,

    minStayMonths: { type: Number, min: 0 },

    photos: [{ type: String }],

    // Disclosures about the shared-living situation — always relevant here
    // (unlike on Property.js, where it's conditional on allowsSubletting),
    // since every RoomFlat is inherently a sharing arrangement.
    houseRules: {
      ownerLivesOnPremises: Boolean,
      curfew: {
        hasCurfew: { type: Boolean, default: false },
        time: { type: String },
      },
      oppositeGenderGuestsAllowed: {
        type: String,
        enum: ["allowed", "allowed_with_notice", "not_allowed"],
      },
      overnightGuestsAllowed: {
        type: String,
        enum: ["allowed", "allowed_with_notice", "not_allowed"],
      },
      smokingAllowedOnPremises: Boolean,
      drinkingAllowedOnPremises: Boolean,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },

    openToSwap: {
      type: Boolean,
      default: false,
    },
    swapDetails: {
      desiredLocality: { type: String, trim: true },
      desiredCity: { type: String, trim: true },
      desiredRentRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
      },
    },

    temporaryDetails: {
      startDate: Date,
      endDate: Date,
    },

    status: {
      type: String,
      enum: ["active", "matched", "closed"],
      default: "active",
      index: true,
    },

    interestCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

roomFlatSchema.index({ status: 1, "location.city": 1 });

// Post-match reputation, filled in after a connection has actually played
// out — never self-reported by the owner. See ownerReviewSchema below.
const ownerReviewSchema = new mongoose.Schema(
  {
    roomFlat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomFlat",
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    involvementLevel: {
      type: String,
      enum: ["very_hands_off", "occasional_checkins", "frequently_involved"],
    },
    comment: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

export const OwnerReview = mongoose.model("OwnerReview", ownerReviewSchema);

const RoomFlat = mongoose.model("RoomFlat", roomFlatSchema);

export default RoomFlat;
