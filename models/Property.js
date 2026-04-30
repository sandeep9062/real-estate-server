import mongoose from "mongoose";

/**
 * Location: GeoJSON Point is [lng, lat].
 * `slug`: optional URL key; sparse unique avoids duplicate-key errors when unset.
 */
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true },
  city: { type: String, index: true, trim: true },
  sector: { type: String, index: true, trim: true },
  state: { type: String, index: true, trim: true },
  country: { type: String, trim: true },
  slug: { type: String, unique: true, sparse: true, trim: true },
  pincode: { type: String, trim: true },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
});

locationSchema.index({ coordinates: "2dsphere" });

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    isLandlordProperty: {
      type: Boolean,
      default: true,
    },

    /** Rent = monthly rent; Sale = total asking price (INR). */
    deal: {
      type: String,
      enum: ["Rent", "Sale"],
      required: true,
      index: true,
    },

    ai: {
      description: String,
      matchScore: Number,
      reasons: [String],
      warning: String,
      seoTitle: String,
      seoDescription: String,
    },

    type: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial", "Agricultural"],
      required: true,
      index: true,
    },

    propertyCategory: {
      type: String,
      enum: [
        "Apartment/Flat",
        "House/Villa",
        "Land/Plot",
        "Studio Apartment",
        "Builder Floor",
        "PG/Hostel",
        "Farmhouse",
        "Retail",
        "Office",
        "Industrial",
        "Warehouse",
        "Shop/Showroom",
      ],
      index: true,
    },

    area: {
      value: { type: Number, min: 0, index: true },
      unit: {
        type: String,
        enum: ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"],
      },
    },

    ageOfProperty: {
      type: Number,
    },

    availability: {
      type: String,
      enum: ["Ready to Move", "Under Construction"],
      index: true,
    },

    availableFrom: Date,
    possessionDate: Date,

    /**
     * Matches listing UI: Furnished | Semi Furnished | Un-Furnished.
     * "Fully Furnished" kept for backward compatibility with older documents.
     */
    furnishing: {
      type: String,
      enum: ["Furnished", "Fully Furnished", "Semi Furnished", "Un-Furnished"],
      default: "Un-Furnished",
    },

    facing: {
      type: String,
      trim: true,
    },

    price: { type: Number, min: 0, required: true, index: true },

    /** Monthly — relevant for rent; optional for sale societies. */
    maintenanceCharge: {
      type: Number,
      min: 0,
    },

    /** One-time — relevant when deal is Rent. */
    securityDeposit: {
      type: Number,
      min: 0,
    },

    /** Rent: optional contractual hints (months). */
    lockInMonths: { type: Number, min: 0 },
    noticePeriodDays: { type: Number, min: 0 },

    projectName: {
      type: String,
      index: true,
      trim: true,
    },

    builderName: {
      type: String,
      index: true,
      trim: true,
    },

    totalUnits: Number,

    societyAmenities: [{ type: String, trim: true }],

    /** Generic checklist (lift, gym, etc.) — overlaps societyAmenities; both supported. */
    amenities: [{ type: String, trim: true }],

    pricePerSqft: {
      type: Number,
      min: 0,
      index: true,
    },

    negotiable: {
      type: Boolean,
      default: true,
    },

    postedBy: {
      type: String,
      enum: ["Owner", "Agent", "Builder"],
      default: "Owner",
      index: true,
    },

    contactNumber: [{ type: String, trim: true }],

    preferredContact: {
      type: String,
      enum: ["Call", "WhatsApp", "Email"],
      default: "WhatsApp",
    },

    location: locationSchema,

    commercialPropertyTypes: [{ type: String, trim: true }],
    investmentOptions: [{ type: String, trim: true }],

    ownershipType: {
      type: String,
      enum: ["Freehold", "Leasehold", "Co-operative", "Power of Attorney"],
    },

    approvedBy: {
      type: String,
      trim: true,
    },

    reraNumber: {
      type: String,
      index: true,
      trim: true,
    },

    /** Sale / UC: occupancy certificate — trust for buyers. */
    ocStatus: {
      type: String,
      enum: ["Available", "Applied", "Not issued", "NA"],
    },

    listingAvailability: {
      type: String,
      enum: ["Available", "Fresh", "Under offer", "Booked"],
      default: "Available",
      index: true,
    },

    bulbulVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    ownerVerified: {
      type: Boolean,
      default: false,
    },
    visitVerified: {
      type: Boolean,
      default: false,
    },

    virtualTourUrl: {
      type: String,
      trim: true,
    },

    floorPlanImages: [{ type: String, trim: true }],

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    featuredUntil: Date,

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    leads: {
      type: Number,
      default: 0,
      min: 0,
    },

    isVerified: { type: Boolean, default: false, index: true },

    isActive: { type: Boolean, default: true, index: true },

    deletedAt: { type: Date, default: null, index: true },

    adminNotes: {
      type: String,
      trim: true,
    },

    image: {
      type: [String],
      default: [],
    },

    videoUrl: { type: String, trim: true },

    floor: { type: Number, min: 0 },

    facilities: {
      bedrooms: { type: Number, min: 0, index: true },
      servantRooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      parkings: { type: Number, min: 0 },
      balconies: { type: Number, min: 0 },
      parkingType: {
        type: String,
        enum: ["None", "Open", "Covered", "Both"],
      },
      securityFeatures: [
        {
          type: String,
          enum: ["CCTV", "Guard", "Biometric", "Gated"],
        },
      ],
      waterSupply: {
        type: String,
        enum: ["Municipal", "Borewell", "Both"],
      },
      powerBackup: {
        type: Boolean,
        default: false,
      },
      totalFloors: { type: Number, min: 0 },
    },

    nearbyPlaces: {
      schools: [String],
      hospitals: [String],
      metroStations: [String],
      malls: [String],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Active", "Sold", "Rented", "Inactive", "Review Required"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

propertySchema.index({ deal: 1, "location.city": 1, isActive: 1, deletedAt: 1 });
propertySchema.index({ deal: 1, price: 1 });
propertySchema.index({ type: 1, propertyCategory: 1 });

propertySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

propertySchema.set("toJSON", {
  virtuals: true,
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
