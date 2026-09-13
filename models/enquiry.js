import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    // Personal Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      //unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
     // unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Property Preferences
    propertyType: {
      type: String,
      required: true,
      trim: true,
    },
    bedrooms: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      required: true,
      trim: true,
    },
    carpetAreaMin: {
      type: Number,
      min: 0,
    },
    carpetAreaMax: {
      type: Number,
      min: 0,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    /** Rent = tenant looking to rent; Sale = buyer looking to purchase. */
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
        "Warehouse",
        "Shop/Showroom",
      ],
      index: true,
    },

    availability: {
      type: String,
      enum: ["Ready to Move", "Under Construction"],
      index: true,
    },

    furnishing: {
      type: String,
      enum: ["Furnished", "Fully Furnished", "Semi Furnished", "Un-Furnished"],
      default: "Un-Furnished",
    },

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

    ownershipType: {
      type: String,
      enum: ["Freehold", "Leasehold", "Co-operative", "Power of Attorney"],
    },

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

    // Financial Information
    income: {
      type: String,
      trim: true,
    },
    preApprovedLoan: {
      type: String,
      trim: true,
    },
    needLoanAssistance: {
      type: Boolean,
      default: false,
    },

    // Purchase Intent
    purchasePurpose: {
      type: String,
      trim: true,
    },
    timeline: {
      type: String,
      required: true,
      trim: true,
    },
    reraOnly: {
      type: Boolean,
      default: false,
    },

    // Communication Preferences
    callbackTime: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    consentGiven: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
