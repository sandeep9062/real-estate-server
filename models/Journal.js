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
    // FIX: the admin form allows up to 120 chars for metaTitle, but the schema
    // capped it at 70, so any longer title failed validation on save.
    metaTitle: { type: String, trim: true, maxlength: 120 },
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

// NOTE: there is intentionally NO pre("save") hook here. wordCount,
// readingTime and publishedAt are computed in journalController.js, so saving
// never depends on Mongoose hook/`next` behaviour (which caused
// "next is not a function").

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
// Speed up the public list endpoint (filters on isActive, sorts by createdAt)
journalSchema.index({ isActive: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
