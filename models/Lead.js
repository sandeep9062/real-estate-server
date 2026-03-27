import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Basic phone number validation (10 digits)
          return /^\d{10}$/.test(v);
        },
        message: "Please enter a valid 10-digit phone number",
      },
    },
    type: {
      type: String,
      enum: ["BROCHURE_REQUEST"],
      default: "BROCHURE_REQUEST",
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "CONVERTED", "LOST"],
      default: "PENDING",
      index: true,
    },
    brochureUrl: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ["WHATSAPP", "WEBSITE", "OTHER"],
      default: "WHATSAPP",
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

leadSchema.set("toJSON", {
  virtuals: true,
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
