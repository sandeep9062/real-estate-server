import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One Agent doc per User (prevents duplicates from double submits/retries)
    },
    // Basic Profile
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    title: { type: String, trim: true }, // e.g. "Senior Property Advisor"
    bio: { type: String, trim: true }, // Short bio for cards
    longBio: { type: String, trim: true }, // Detailed bio for profile page

    agencyName: { type: String, trim: true },

    // Contact
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    // Visual
    avatar: { type: String }, // Profile image URL
    avatarColor: { type: String, default: "#4161df" }, // Fallback colour for initials avatar
    coverColor: { type: String, default: "#0d1640" }, // Cover banner colour
    coverImage: { type: String }, // Optional cover image URL

    // Ratings & Reputation
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Performance Stats
    experience: { type: Number, default: 0 }, // Years of experience
    deals: { type: Number, default: 0 }, // Total deals closed
    responseTime: { type: String, default: "< 1 hr" }, // e.g. "< 1 hr", "< 2 hrs"
    responseRate: { type: String, default: "95%" }, // e.g. "98%"

    // Verification & Status
    verified: { type: Boolean, default: false },
    topAgent: { type: Boolean, default: false },
    rera: { type: String, trim: true }, // RERA registration number

    featured: { type: Boolean, default: false }, // Featured on homepage

    // Service Areas
    locations: [{ type: String }], // Cities served (Chandigarh, Mohali, Panchkula, etc.)
    specialisations: [{ type: String }], // e.g. Luxury Villas, Residential, Commercial
    languages: [{ type: String }], // e.g. Hindi, English, Punjabi
    isActive: {
      type: Boolean,
      default: true,
    },
    // Achievements
    achievements: [{ type: String }], // List of achievements for profile page

    // Stats displayed on profile page
    stats: [
      {
        label: { type: String },
        value: { type: String },
        icon: { type: String }, // Emoji icon
      },
    ],

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Auto-generate slug from name before saving
agentSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

// Index for faster queries
agentSchema.index({ status: 1, verified: 1, featured: 1 });
agentSchema.index({ locations: 1 });
agentSchema.index({ specialisations: 1 });

// Transform output
agentSchema.methods.toJSON = function () {
  const agent = this.toObject();
  delete agent.__v;
  return agent;
};

export default mongoose.models.Agent || mongoose.model("Agent", agentSchema);
