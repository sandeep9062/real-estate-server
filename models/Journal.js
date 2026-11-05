import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    }, // e.g., "investment-guide-sector-115-mohali"
    category: String,

    excerpt: String,
    content: String,
    coverImage: String,
    altText: String,
    coverImageWidth: Number,
    coverImageHeight: Number,
    readingTime: Number, // minutes
    wordCount: Number,
    author: {
      name: { type: String, default: "PropertyBulbul Editorial", trim: true },
      role: { type: String, trim: true },
      avatar: { type: String, trim: true },
    },
    targetCity: String,
    targetSector: String,
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 170 },
    keywords: [String],
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },

    views: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Publishing
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    publishedAt: Date,
    lastReviewedAt: Date,

    tags: [{ type: String, lowercase: true, trim: true }],
    slugHistory: [{ type: String, lowercase: true, trim: true }],
    relatedSlugs: [{ type: String, lowercase: true, trim: true }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Compute reading time and word count whenever content changes
journalSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.max(1, Math.round(words / 200));
  }
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

// Public list: published, not deleted, newest first
journalSchema.index({ status: 1, deletedAt: 1, publishedAt: -1 });
// Category pages
journalSchema.index({ category: 1, status: 1, publishedAt: -1 });
// Featured block
journalSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });
// Tag filtering index (used by the list endpoint with ?tag=filter)
journalSchema.index({ tags: 1, status: 1, publishedAt: -1 });
// Old-slug redirects
journalSchema.index({ slugHistory: 1 });
// Speed up the public list endpoint (GET /api/v1/journals), which filters
// on `isActive` and sorts by `createdAt` desc before skip/limit pagination —
// without this the DB does a full collection sort on every page request.
journalSchema.index({ isActive: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
