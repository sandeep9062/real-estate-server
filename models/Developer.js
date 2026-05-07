// model/Developer.js
import mongoose from "mongoose";

const developerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Sushma Group"
    slug: { type: String, unique: true, sparse: true }, // URL-friendly slug
    logo: String, // Logo image URL
    coverImage: String, // Hero/banner image for the developer profile page
    description: String, // About the developer
    shortDescription: String, // Brief tagline (max 200 chars)
    website: String, // Official website URL
    headquarters: String, // e.g., "Chandigarh"
    cities: [{ type: String }], // Cities where they operate (Chandigarh, Mohali, Panchkula, Zirakpur)
    phone: String, // Contact phone number
    email: String, // Contact email address

    // Verification & Status
    isVerified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }, // Featured on homepage
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Company Details
    establishedYear: Number, // Year founded, e.g., 1995
    completedProjects: { type: Number, default: 0 },
    ongoingProjects: { type: Number, default: 0 },
    totalUnitsDelivered: { type: Number, default: 0 },

    // Social Media Links
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },

    // Recognition
    awards: [{ title: String, year: Number, description: String }],

    // Gallery & Media
    gallery: [String], // Additional project/brand images

    // Ratings & Reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // SEO
    metaTitle: String,
    metaDescription: String,

    // Link to the User account(s) that can edit this profile
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Auto-generate slug from name before saving
developerSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.models.Developer ||
  mongoose.model("Developer", developerSchema);
