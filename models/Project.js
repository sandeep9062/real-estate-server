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
      ref: "Developer", // Link this to a Developer model later
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
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
    },
    pricing: {
      from: { type: Number, required: true },
      to: { type: Number },
      currency: { type: String, default: "INR" },
    },
    amenities: [
      {
        type: String, // e.g., ['Gym', 'Clubhouse', 'Power Backup', 'EV Charging']
      },
    ],
    media: {
      brochureUrl: String,
      images: [String], // Array of URLs (S3/Cloudinary)
      videoTour: String,
    },
    stats: {
      totalUnits: Number,
      availableUnits: Number,
      possessionDate: Date,
      areaRange: String, // e.g., "1200 - 3500 sqft"
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

// Middleware to auto-generate slug for SEO
ProjectSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().split(" ").join("-");
  }
  next();
});

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
