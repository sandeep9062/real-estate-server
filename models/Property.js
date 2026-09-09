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
  landmark: { type: String, trim: true },
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
    slug: { type: String, unique: true, sparse: true, trim: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    /** Rent = monthly rent; Sale = total asking price (INR). */
    deal: {
      type: String,
      enum: ["Rent", "Sale"],
      required: true,
      index: true,
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

    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },

    ai: {
      description: String,
      matchScore: Number,
      reasons: [String],
      warning: String,
      seoTitle: String,
      seoDescription: String,
    },
    /** Area is now split into carpetArea and superBuiltUpArea for RERA compliance.
     *  The legacy `area` field is kept as a top-level convenience for backward
     *  compatibility with existing data that hasn't been migrated yet. */
    area: {
      value: { type: Number, min: 0, index: true },
      unit: {
        type: String,
        enum: ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"],
      },

      /** Carpet area (as mandated by RERA) — the net usable floor area. */
      carpetArea: {
        value: { type: Number, min: 0 },
        unit: {
          type: String,
          enum: ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"],
        },
      },

      /** Super built-up area — includes common areas, walls, etc. Builders typically quote this. */
      superBuiltUpArea: {
        value: { type: Number, min: 0 },
        unit: {
          type: String,
          enum: ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"],
        },
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

    /** Detailed construction status breakdown — only relevant when availability is "Under Construction". */
    constructionStatus: {
      /** Percentage of construction completed (0–100). */
      percentageComplete: { type: Number, min: 0, max: 100 },
      /** Current phase of construction (e.g. "Foundation", "Structure", "Finishing", "Handover"). */
      currentPhase: { type: String, trim: true },
      /** Expected date of Occupancy Certificate. */
      expectedOCDate: { type: Date },
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

    tenantPreference: {
      type: String,
      enum: ["Family", "Bachelors", "Any", "Working Professionals", "Students"],
      default: "Any",
    },

    tags: [{ type: String, trim: true }],

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

    /** Rent: does the owner allow subletting / room-sharing? */
    allowsSubletting: {
      type: Boolean,
      default: false,
      index: true,
    },

    /** Rent: how many persons can share the property (only when allowed). */
    maxPersonsSharing: {
      type: Number,
      min: 1,
    },

    /**
     * Rent-only house rules for shared/subletted stays. Enforced at the schema
     * level (see the pre("validate") hook below): the field is stripped unless
     * deal === "Rent" AND allowsSubletting === true.
     */
    houseRules: {
      ownerLivesOnPremises: Boolean,
      curfew: {
        hasCurfew: { type: Boolean, default: false },
        time: { type: String, trim: true },
      },
      oppositeGenderGuestsAllowed: {
        type: String,
        enum: ["allowed", "allowed_with_notice", "not_allowed"],
      },
      overnightGuestsAllowed: {
        type: String,
        enum: ["allowed", "allowed_with_notice", "not_allowed"],
      },
      smokingAllowedOnPremises: Boolean,
      drinkingAllowedOnPremises: Boolean,
    },

    /** Rent: are pets allowed in the property? */
    petsAllowed: {
      type: Boolean,
      default: false,
    },

    // project and builder details
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

    /** Generic checklist (lift, gym, etc.). */
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
      enum: [
        "Available",
        "Fresh",
        "Under offer",
        "Booked",
        "Sold",
        "Rented",
        "Review Required",
        "Non Available",
      ],
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

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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
  },
  {
    timestamps: true,
  },
);

propertySchema.index({
  deal: 1,
  "location.city": 1,
  isActive: 1,
  deletedAt: 1,
});
propertySchema.index({ deal: 1, price: 1 });
propertySchema.index({ type: 1, propertyCategory: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ isActive: 1, createdAt: -1 });
propertySchema.index({ "location.city": 1, isActive: 1, createdAt: -1 });
propertySchema.index({ "location.sector": 1, isActive: 1 });
propertySchema.index({ "location.state": 1, isActive: 1 });

propertySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

propertySchema.set("toJSON", {
  virtuals: true,
});

/**
 * houseRules only apply to rental listings that explicitly allow
 * subletting / room-sharing. Stripped before validation runs so a direct
 * API call can never persist them on the wrong listing type — and so an
 * otherwise-valid request isn't rejected with a confusing enum error.
 */
propertySchema.pre("validate", function () {
  if (!(this.deal === "Rent" && this.allowsSubletting)) {
    this.houseRules = undefined;
  }
});

/**
 * Abuse guard: when an account already has 2+ "Owner"-tagged listings, a new
 * owner-tagged listing is the 3rd+ — flag it in adminNotes and park it in
 * "Review Required" so admins can verify before it goes live.
 */
propertySchema.pre("save", async function () {
  if (this.isNew && this.postedBy === "Owner" && this.user) {
    const existingOwnerListings = await this.constructor.countDocuments({
      user: this.user,
      postedBy: "Owner",
      _id: { $ne: this._id },
    });
    if (existingOwnerListings >= 2) {
      this.adminNotes =
        (this.adminNotes ? `${this.adminNotes} ` : "") +
        "[Flagged: 3rd+ owner-tagged listing from this account]";
      this.listingAvailability = "Review Required";
    }
  }
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
