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
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
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
