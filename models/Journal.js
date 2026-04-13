import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true }, // e.g., "investment-guide-sector-115-mohali"
  category: String,
  excerpt: String,
  content: String,
  coverImage: String,
  targetSector: String,
  createdAt: { type: Date, default: Date.now },
});

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
