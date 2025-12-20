import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },

  propertyType: { type: String, required: true, trim: true },
  bedrooms: { type: String, trim: true },
  budget: { type: String, required: true, trim: true },
  carpetAreaMin: { type: Number, min: 0 },
  carpetAreaMax: { type: Number, min: 0 },
  amenities: [{ type: String, trim: true }],

  income: { type: String, trim: true },
  preApprovedLoan: { type: String, trim: true },
  needLoanAssistance: { type: Boolean, default: false },

  purchasePurpose: { type: String, trim: true },
  timeline: { type: String, required: true, trim: true },
  reraOnly: { type: Boolean, default: false },

  callbackTime: { type: String, trim: true },
  message: { type: String, trim: true },
  source: { type: String, trim: true },

  consentGiven: { type: Boolean, required: true },

  agentSummary: { type: String },
});

export default mongoose.models.Lead ||
  mongoose.model("ChatBotLeads", LeadSchema);
