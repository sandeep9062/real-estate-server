import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Developer",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true, // Speed up queries on slug for Next.js dynamic routing
    },
    location: {
      address: String,
      sector: String,
      city: {
        type: String,
        enum: [
          "Chandigarh",
          "Mohali",
          "Panchkula",
          "Zirakpur",
          "New Chandigarh",
          "Kharar", // Added Kharar since your sitemap covers it!
        ],
        required: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    description: {
      type: String,
      required: true,
    },
    projectType: {
      type: String,
      enum: ["Residential", "Commercial", "Mixed-Use", "Industrial"],
      default: "Residential",
    },
    constructionStatus: {
      type: String,
      enum: [
        "Ready to Move",
        "Under Construction",
        "Newly Launched",
        "Upcoming",
      ],
      default: "Under Construction",
    },
    reraNumber: {
      type: String,
      required: [true, "RERA number is vital for platform authority"],
      unique: true,
      trim: true,
    },
    pricing: {
      from: { type: Number, required: true }, // Store in absolute numbers (e.g., 7500000 for 75L)
      to: { type: Number },
      currency: { type: String, default: "INR" },
    },
    amenities: [
      {
        type: String,
      },
    ],
    media: {
      brochureUrl: String,
      images: [String],
      videoTour: String,
    },
    stats: {
      totalUnits: Number,
      availableUnits: Number,
      possessionDate: Date,
      areaRange: String,
    },
    // ── SEO HYPER-GROWTH FIELDS ──
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Robust Slug Generation Middleware for Advanced SEO
ProjectSchema.pre("save", function (next) {
  if (this.isModified("name") && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove all special characters like commas, dots, colons
      .replace(/\s+/g, "-") // Collapse multiple spaces into a single hyphen
      .replace(/-+/g, "-"); // Collapse multiple hyphens into a single hyphen
  }
  next();
});

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
