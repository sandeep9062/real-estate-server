import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slugHistory: [{ type: String, lowercase: true, trim: true }],

    category: { type: String, required: true, trim: true },
    tags: [{ type: String, lowercase: true, trim: true }],

    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    faqs: [faqSchema],

    coverImage: String,
    altText: String,
    coverImageWidth: Number,
    coverImageHeight: Number,

    // Rich author for E-E-A-T signals
    author: {
      name: { type: String, default: "PropertyBulbul Editorial", trim: true },
      role: { type: String, trim: true },
      avatar: { type: String, trim: true },
    },

    // Related listings block
    targetCity: String,
    targetSector: String,

    // Ordered guide series
    series: { type: String, trim: true },
    articleNumber: { type: Number },

    // SEO
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 170 },
    keywords: [String],
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },

    // Internal linking
    relatedSlugs: [{ type: String, lowercase: true, trim: true }],

    // Computed in pre-save
    readingTime: Number, // minutes
    wordCount: Number,

    // Publishing
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
    lastReviewedAt: Date,

    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
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

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
