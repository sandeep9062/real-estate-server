import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "My search",
    },
    /** Mirrors GET /api/properties query fields (strings) */
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notifyEmail: {
      type: Boolean,
      default: true,
    },
    notifyInApp: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /** New listings with createdAt > cursorAt are candidates for alerts */
    cursorAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true },
);

savedSearchSchema.index({ user: 1, createdAt: -1 });

const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);

export default SavedSearch;
