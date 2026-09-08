import mongoose from "mongoose";

/**
 * RoomFlat
 *
 * The physical-property record for the flatmate feature. Only created
 * when the associated RoommateProfile's intent is "has_room", "swap", or
 * "temporary_offer" — profiles that are just searching (seeking_room,
 * temporary_seek) never get one of these, since there's no property to
 * describe yet.
 *
 * Deliberately mirrors your Property model's location convention where
 * possible (GeoJSON Point) so nearby-search logic can eventually be
 * shared between the two features.
 */

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

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address: { type: String, trim: true },
      locality: { type: String, trim: true, index: true },
      city: { type: String, trim: true, index: true },
    },

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

    // Only meaningful when the parent RoommateProfile.intent === "swap"
    swapDetails: {
      desiredLocality: { type: String, trim: true },
      desiredCity: { type: String, trim: true },
      desiredRentRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
      },
    },

    // Only meaningful when intent === "temporary_offer"
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
  },
  {
    timestamps: true,
  },
);

roomFlatSchema.index({ location: "2dsphere" });
roomFlatSchema.index({ status: 1, city: 1 });

const RoomFlat = mongoose.model("RoomFlat", roomFlatSchema);

export default RoomFlat;
