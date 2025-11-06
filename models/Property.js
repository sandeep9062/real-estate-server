import mongoose from "mongoose";

// location subSchema (for map + radius search later)
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, index: true },
  state: { type: String, index: true },
  country: {
    type: String,
  },

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

    availability: {
      type: String,
      enum: ["Ready to Move", "Under Construction"],
      index: true,
    },

    furnishing: {
      type: String,
      enum: ["Furnished", "Semi Furnished", "Un-Furnished"],
      default: "Un-Furnished",
    },

    price: { type: Number, min: 0, required: true, index: true },

    postedBy: {
      type: String,
      enum: ["Owner", "Agent", "Builder"],
      default: "Owner",
      index: true,
    },

    location: locationSchema,

    commercialPropertyTypes: [{ type: String }],
    investmentOptions: [{ type: String }],

    // admin controls
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },

    image: {
      type: [String],
      required: true,
    },
    facilities: {
      bedrooms: { type: Number, min: 0, index: true },
      serventRooms: Number,
      bathrooms: Number,
      parkings: Number,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
