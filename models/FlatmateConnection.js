import mongoose from "mongoose";

/**
 * FlatmateConnection
 *
 * A connect request between two RoommateProfiles. References profiles
 * (people), not RoomFlat (property) directly — even when the interest was
 * sparked by viewing a specific room, the actual thing being decided is
 * "do we want to live together," so the request lives at the person level.
 * `roomFlat` is stored for context (which listing prompted this) but isn't
 * the primary key of the relationship.
 */

const flatmateConnectionSchema = new mongoose.Schema(
  {
    fromProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoommateProfile",
      required: true,
      index: true,
    },
    toProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoommateProfile",
      required: true,
      index: true,
    },
    // Optional: which property (if any) this request was made in the
    // context of — set when fromProfile is a seeker connecting to a
    // toProfile that has_room.
    roomFlat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomFlat",
    },
    message: { type: String, trim: true, maxlength: 500 },
    matchScore: { type: Number, min: 0, max: 100 }, // snapshot at request time
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "withdrawn"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

flatmateConnectionSchema.index(
  { fromProfile: 1, toProfile: 1 },
  { unique: true },
);

const FlatmateConnection = mongoose.model(
  "FlatmateConnection",
  flatmateConnectionSchema,
);

export default FlatmateConnection;
