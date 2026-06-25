import mongoose from "mongoose";

const landlordSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Basic Profile
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    title: { type: String, trim: true }, // e.g. "Property Owner", "Landlord"
    bio: { type: String, trim: true },
    longBio: { type: String, trim: true },

    // Contact
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    // Address
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // Visual
    avatar: { type: String }, // Profile image URL
    avatarColor: { type: String, default: "#4161df" }, // Fallback colour for initials avatar
    coverImage: { type: String }, // Optional cover image URL

    // Property Portfolio
    totalProperties: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    propertyTypes: [{ type: String }], // e.g. Residential, Commercial, Plot

    // Ratings & Reputation
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Verification & Status
    isVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false }, // ID proof verified
    isCompany: { type: Boolean, default: false }, // True if company/corporate landlord
    companyName: { type: String, trim: true },
    gstin: { type: String, trim: true }, // GST number for corporate landlords
    pan: { type: String, trim: true }, // PAN card number
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    featured: { type: Boolean, default: false },

    // Service Areas
    locations: [{ type: String }], // Cities/areas served
    languages: [{ type: String }], // e.g. Hindi, English, Punjabi

    // Document Management
    documents: [
      {
        title: { type: String },
        type: { type: String }, // e.g. "id_proof", "address_proof", "property_doc", "agreement"
        url: { type: String },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Bank Details (for payouts)
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },

    // Preferences
    preferences: {
      contactMethod: {
        type: String,
        enum: ["phone", "email", "whatsapp"],
        default: "phone",
      },
      availableTimings: { type: String }, // e.g. "10:00 AM - 6:00 PM"
      acceptsVisits: { type: Boolean, default: true },
    },

    // Stats
    totalDeals: { type: Number, default: 0 },
    responseTime: { type: String, default: "< 1 hr" },
    responseRate: { type: String, default: "95%" },
    memberSince: { type: Date, default: Date.now },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Auto-generate slug from name before saving
landlordSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Indexes for faster queries
landlordSchema.index({ status: 1, isVerified: 1 });
landlordSchema.index({ city: 1 });
landlordSchema.index({ locations: 1 });
landlordSchema.index({ userID: 1 });

// Transform output (remove __v, hide sensitive bank details)
landlordSchema.methods.toJSON = function () {
  const landlord = this.toObject();
  delete landlord.__v;

  // Hide sensitive bank details in API responses
  if (landlord.bankDetails) {
    if (landlord.bankDetails.accountNumber) {
      landlord.bankDetails.accountNumber =
        "XXXX" + landlord.bankDetails.accountNumber.slice(-4);
    }
  }

  return landlord;
};

export default mongoose.models.Landlord ||
  mongoose.model("Landlord", landlordSchema);
