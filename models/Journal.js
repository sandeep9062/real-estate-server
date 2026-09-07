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
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
