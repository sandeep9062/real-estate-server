import mongoose from "mongoose";

/**
 * Lead statuses.
 * - Legacy brochure-request leads keep using: PENDING | CONTACTED | CONVERTED | LOST
 * - CRM (WhatsApp-click) leads use:            New | Contacted | Negotiating | Closed | Lost
 */
export const LEAD_STATUSES = [
  // Legacy brochure-request statuses
  "PENDING",
  "CONTACTED",
  "CONVERTED",
  "LOST",
  // CRM lead statuses
  "New",
  "Contacted",
  "Negotiating",
  "Closed",
  "Lost",
];

export const LEAD_SOURCES = ["WHATSAPP", "WEBSITE", "OTHER", "whatsapp_click"];

export const LEAD_TYPES = ["BROCHURE_REQUEST", "WHATSAPP_CLICK"];

const leadSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    // Legacy brochure-request leads are tied to the listing's broker (User).
    // Kept intact — the brochure flow still writes this field.
    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    // CRM (WhatsApp-click) leads are tied to the listing's agent (User).
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    // Legacy brochure-request buyer info (brochure flow still sets these).
    userName: { type: String, trim: true },
    userPhone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^\d{10}$/.test(v),
        message: "Please enter a valid 10-digit phone number",
      },
    },
    // CRM (WhatsApp-click) buyer info — optional, captured from click/session when available.
    buyerName: { type: String, trim: true, default: null },
    buyerPhone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (v) => !v || /^[+]?[\d\s()-]{7,18}$/.test(v),
        message: "Please enter a valid phone number",
      },
    },
    type: {
      type: String,
      enum: LEAD_TYPES,
      default: "BROCHURE_REQUEST",
      index: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
      index: true,
    },
    brochureUrl: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: "WHATSAPP",
    },
    // Last time the agent acted on the lead (status/notes change). Used for stale-lead flagging.
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A WhatsApp-click lead must always be tied to an owning agent.
leadSchema.pre("validate", function () {
  if (this.type === "WHATSAPP_CLICK" && !this.agentId) {
    this.invalidate("agentId", "agentId is required for WhatsApp-click leads");
  }
});

// Keep lastActivityAt in sync whenever status or notes change (and on creation).
leadSchema.pre("save", function () {
  if (this.isNew) {
    this.lastActivityAt = this.lastActivityAt || new Date();
  } else if (this.isModified("status") || this.isModified("notes")) {
    this.lastActivityAt = new Date();
  }
});

// Compound indexes for the agent-dashboard queries.
leadSchema.index({ agentId: 1, lastActivityAt: -1 });
leadSchema.index({ agentId: 1, status: 1 });

leadSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

leadSchema.set("toJSON", {
  virtuals: true,
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
