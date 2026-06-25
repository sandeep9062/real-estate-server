import mongoose from "mongoose";

const roommateSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Context Status: Does the user ALREADY have a flat and need a partner,
    // or are they looking to join an existing flat setup?
    searchType: {
      type: String,
      enum: ["have_flat", "need_flat"],
      required: true,
    },
    // Reference link to the primary Property model if searchType is "have_flat"
    propertyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    // Basic Profile Snapshot
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    gender: {
      type: String,
      enum: ["male", "female", "any"],
      required: true,
    },
    bio: { type: String, trim: true }, // Catchphrase for mobile presentation cards

    // Financial Splitting Blueprint
    approxBudget: { type: Number, required: true, default: 0 }, // Expected monthly rent contribution
    moveInDate: { type: Date, default: Date.now },

    // Hyper-Local Target Nodes (Tricity Alignment)
    preferredLocations: [{ type: String }], // e.g., ["Sector 22", "Phase 8", "Sunny Enclave"]
    cities: [{ type: String }], // e.g., ["Chandigarh", "Mohali", "Kharar"]

    // Core Lifestyle Compatibility Filters (Crucial for Flutter Matchmaker Flow)
    lifestyle: {
      profession: {
        type: String,
        enum: ["student", "working_professional", "any"],
        default: "any",
      },
      dietary: {
        type: String,
        enum: ["veg", "non_veg", "any"],
        default: "any",
      },
      smoking: { type: Boolean, default: false },
      drinking: { type: Boolean, default: false },
      petsFriendly: { type: Boolean, default: false },
      genderPreference: {
        type: String,
        enum: ["same_gender_only", "no_preference"],
        default: "same_gender_only",
      },
      routine: {
        type: String,
        enum: ["early_bird", "night_owl", "flexible"],
        default: "flexible",
      },
    },

    // Room Layout Specifics (If searchType is "have_flat")
    roomDetails: {
      occupancyType: {
        type: String,
        enum: ["single", "double_sharing", "triple_sharing", "any"],
        default: "any",
      },
      amenities: [{ type: String }], // e.g., ["WiFi", "AC", "Geyser", "Kitchen Access"]
      washroom: {
        type: String,
        enum: ["attached", "shared"],
        default: "attached",
      },
    },

    // Verification & Security (Aligning with Background Certification Policy)
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "found_match", "inactive"],
      default: "active",
    },

    // Contact Configuration
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },

    // Visual Presentation Tokens
    avatar: { type: String }, // User profile image CDN bucket link
    avatarColor: { type: String, default: "#4161df" }, // Fallback color token for mobile UI initials

    // SEO Configurations
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true, // Auto-tracks listing lifespans via createdAt / updatedAt fields
  },
);

// Pre-save Middleware hook to synchronize slugs dynamically from name
roommateSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Structural Compound Database Indexing for High-Speed Filtering Queries
roommateSchema.index({ slug: 1 });
roommateSchema.index({ status: 1, verified: 1 });
roommateSchema.index({ "lifestyle.dietary": 1, "lifestyle.profession": 1 });
roommateSchema.index({ cities: 1, approxBudget: 1 });

// Output Transform Pipeline to strip system fields from JSON transmissions
roommateSchema.methods.toJSON = function () {
  const roommate = this.toObject();
  delete roommate.__v;
  return roommate;
};

export default mongoose.models.Roommate ||
  mongoose.model("Roommate", roommateSchema);
