import mongoose from "mongoose";

// location subSchema (for map + radius search later)
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, index: true },
  sector: { type: String, index: true },
  state: { type: String, index: true },
  country: {
    type: String,
  },

  slug: { type: String, unique: true },

  pincode: { type: String },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat] order
  },
});

locationSchema.index({ coordinates: "2dsphere" });

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true, trim: true },

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
      enum: ["Residential", "Commercial"],
      required: true,
      index: true,
    },

    propertyCategory: {
      type: String,
      enum: [
        "Apartment/Flat",
        "House/Villa",
        "Land/Plot",
        "Retail",
        "Office",
        "Industrial",
        "Warehouse",
        "Shop/Showroom",
      ],
    },
    area: {
      value: { type: Number, min: 1, index: true },
      unit: {
        type: String,
        enum: ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"],
      },
    },
    ageOfProperty: {
      type: Number, // in years
    },

    availability: {
      type: String,
      enum: ["Ready to Move", "Under Construction"],
      index: true,
    },

    availableFrom: Date,
    possessionDate: Date,

    furnishing: {
      type: String,
      enum: ["Furnished", "Semi Furnished", "Un-Furnished"],
      default: "Un-Furnished",
    },
    facing: {
      type: String,
      enum: ["North", "South", "East", "West", "North-East", "North-West"],
    },

    price: { type: Number, min: 0, required: true, index: true },

    maintenanceCharge: {
      type: Number, // monthly
    },

    securityDeposit: {
      type: Number, // for rent
    },

    //builder project details

    projectName: {
      type: String,
      index: true,
    },

    builderName: {
      type: String,
      index: true,
    },

    totalUnits: Number,

    societyAmenities: [
      {
        type: String,
      },
    ],

    pricePerSqft: {
      type: Number,
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

    contactNumber: [{ type: String }],
    preferredContact: {
      type: String,
      enum: ["Call", "WhatsApp", "Email"],
      default: "WhatsApp",
    },

    location: locationSchema,

    commercialPropertyTypes: [{ type: String }],
    investmentOptions: [{ type: String }],

    ownershipType: {
      type: String,
      enum: ["Freehold", "Leasehold", "Co-operative", "Power of Attorney"],
    },

    approvedBy: {
      type: String, // GMADA, MC, CHB, etc.
    },

    reraNumber: {
      type: String,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    featuredUntil: Date,

    /* =====================
       STATS
    ====================== */
    views: {
      type: Number,
      default: 0,
    },

    leads: {
      type: Number,
      default: 0,
    },

    // admin controls
    isVerified: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },

    adminNotes: {
      type: String, // internal use only
    },

    image: {
      type: [String],
      required: false, // Temporarily made optional to debug the issue
    },
    videoUrl: String,
    floor: Number,

    facilities: {
      bedrooms: { type: Number, min: 0, index: true },
      servantRooms: Number,
      bathrooms: Number,
      parkings: Number,
      securityFeatures: [
        {
          type: String,
          enum: ["CCTV", "Guard", "Biometric", "Gated"],
        },
      ],

      // parking: {
      //   type: String,
      //   enum: ["None", "Open", "Covered", "Both"],
      // },

      waterSupply: {
        type: String,
        enum: ["Municipal", "Borewell", "Both"],
      },

      powerBackup: {
        type: Boolean,
        default: false,
      },
      totalFloors: Number,
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
    },

    /* =====================
       STATUS
    ====================== */
    status: {
      type: String,
      enum: ["Active", "Sold", "Rented", "Inactive"],
      default: "Active",
      index: true,
    },

    // for rent

    //     roomType: {
    //       type: String,
    //       enum: ["Private Room", "Shared Room", "PG", "Hostel"],
    //       index: true,
    //     },

    //     sharingType: {
    //       type: String,
    //       enum: ["Single", "Double", "Triple", "Four Sharing"],
    //       index: true,
    //     },

    //     bedsAvailable: {
    //       type: Number,
    //     },

    //     preferredTenants: {
    //       type: String,
    //       enum: ["Students", "Working Professionals", "Anyone"],
    // index: true,
    //     },

    //     genderPreference: {
    //       type: String,
    //       enum: ["Male", "Female", "Any"],
    //       index: true,
    //     },
    // rentPerPerson: {
    //   type: Number,
    //   index: true,
    // },

    // electricityChargesIncluded: {
    //   type: Boolean,
    //   default: false,
    // },

    // waterChargesIncluded: {
    //   type: Boolean,
    //   default: true,
    // },

    // wifiIncluded: {
    //   type: Boolean,
    //   default: false,
    // },

    // minimumStayMonths: {
    //   type: Number,
    //   default: 1,
    // },

    // noticePeriodDays: {
    //   type: Number,
    //   default: 30,
    // },

    // nearbyInstitutes: [
    //   {
    //     name: String,
    //     distanceInKm: Number,
    //   },
    // ],

    // studentAmenities: [
    //   {
    //     type: String,
    //     enum: [
    //       "Study Table",
    //       "Chair",
    //       "Cupboard",
    //       "Washing Machine",
    //       "RO Water",
    //       "WiFi",
    //       "CCTV",
    //       "Biometric Entry",
    //     ],
    //   },
    // ],

    // gateClosingTime: {
    //   type: String,
    //   igger,
    // },

    // visitorAllowed: {
    //   type: Boolean,
    //   default: false,
    // },

    // smokingAllowed: {
    //   type: Boolean,
    //   default: false,
    // },

    // alcoholAllowed: {
    //   type: Boolean,
    //   default: false,
    // },

    // foodAvailable: {
    //   type: Boolean,
    //   default: false,
    // },

    // foodType: {
    //   type: String,
    //   enum: ["Veg", "Non-Veg", "Both"],
    // },

    // mealsIncluded: {
    //   breakfast: Boolean,
    //   lunch: Boolean,
    //   dinner: Boolean,
    // },
  },
  {
    timestamps: true,
  }
);

propertySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

propertySchema.set("toJSON", {
  virtuals: true,
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
