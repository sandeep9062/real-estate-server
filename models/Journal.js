import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true }, // e.g., "investment-guide-sector-115-mohali"
    category: String,
    excerpt: String,
    content: String,
    coverImage: String,
    targetSector: String,
    metaTitle: String,
    keywords: [String],

    views: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Speed up the public list endpoint (GET /api/v1/journals), which filters
// on `isActive` and sorts by `createdAt` desc before skip/limit pagination —
// without this the DB does a full collection sort on every page request.
journalSchema.index({ isActive: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
