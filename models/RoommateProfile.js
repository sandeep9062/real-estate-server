import mongoose from "mongoose";

/**
 * RoommateProfile
 *
 * One profile per user participating in the flatmate feature — the
 * universal record. Everyone using the feature has exactly one of these,
 * regardless of intent.
 *
 * A profile with intent "has_room" / "swap" / "temporary_offer" links to a
 * RoomFlat document (the actual property). A profile with intent
 * "seeking_room" / "temporary_seek" has no property — it searches by
 * `searchArea` + `budgetRange` directly on this document instead.
 *
 * Kept as its own collection (not embedded on User) because:
 *  1. Verification documents need stricter, narrower access control than
 *     the rest of a user's account — easy to enforce in a dedicated
 *     collection, hard to enforce as a buried field on a frequently
 *     fetched User document.
 *  2. Most users never touch this feature — keeping it separate means the
 *     core User document stays small.
 */

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["aadhaar", "passport", "driving_license", "voter_id", "other"],
      required: true,
    },
    // Masked reference only — NEVER the full ID number in plaintext.
    // Encrypt at the application layer if the full number is ever needed.
    lastFourDigits: {
      type: String,
      maxlength: 4,
    },
    // Path/key into PRIVATE file storage, never a public URL. Serve via
    // short-lived signed URLs generated on demand.
    fileKey: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // an admin
    },
    verifiedAt: Date,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const roommateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    intent: {
      type: String,
      enum: [
        "has_room",
        "seeking_room",
        "swap",
        "temporary_offer",
        "temporary_seek",
      ],
      required: true,
      index: true,
    },

    // Only set when intent is has_room / swap / temporary_offer
    roomFlat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomFlat",
    },

    // Only relevant when intent is seeking_room / temporary_seek — there's
    // no property to attach a location to, so the search area lives here.
    searchArea: {
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        // [lng, lat]. Must ALWAYS be present — the 2dsphere index below
        // cannot be built/queried when a doc has type: "Point" without
        // coordinates ("Can't extract geo keys … got type missing").
        coordinates: { type: [Number], default: [0, 0] },
      },
      locality: { type: String, trim: true },
      city: { type: String, trim: true, index: true },
      radiusKm: { type: Number, default: 5 },
    },
    budgetRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    moveInDate: Date,
    stayDurationMonths: Number, // relevant for temporary_seek

    // ---- Bio / identity ----
    bio: { type: String, trim: true, maxlength: 500 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    dateOfBirth: Date,
    occupation: {
      type: String,
      enum: ["student", "working_professional", "self_employed", "other"],
    },
    workSchedule: {
      type: String,
      enum: ["wfh", "office", "hybrid", "flexible", "irregular"],
    },
    sleepSchedule: {
      type: String,
      enum: ["early_bird", "night_owl", "flexible"],
    },
    languages: [{ type: String, trim: true }],

    // ---- Personal habits (what THIS person is like) ----
    habits: {
      smoking: { type: String, enum: ["yes", "no"] },
      drinking: { type: String, enum: ["yes", "no"] },
      nightlifeFriendly: { type: String, enum: ["yes", "no"] },
      foodPreference: {
        type: String,
        enum: ["veg", "non_veg", "eggetarian", "vegan"],
      },
      ownsPets: Boolean,
      okayWithPets: Boolean,
      cleanlinessLevel: {
        type: String,
        enum: ["very_tidy", "moderately_tidy", "relaxed"],
      },
      guestsFrequency: {
        type: String,
        enum: ["rarely", "sometimes", "often"],
      },
    },

    // ---- What they want IN a roommate (requirements for a match) ----
    lookingFor: {
      genderPreference: {
        type: String,
        enum: ["male", "female", "any"],
        default: "any",
      },
      ageRange: {
        min: { type: Number, min: 16, max: 100 },
        max: { type: Number, min: 16, max: 100 },
      },
      smoking: {
        type: String,
        enum: ["yes", "no", "no_preference"],
        default: "no_preference",
      },
      drinking: {
        type: String,
        enum: ["yes", "no", "no_preference"],
        default: "no_preference",
      },
      nightlifeFriendly: {
        type: String,
        enum: ["yes", "no", "no_preference"],
        default: "no_preference",
      },
      foodPreference: {
        type: String,
        enum: ["veg", "non_veg", "any"],
        default: "any",
      },
      occupation: {
        type: String,
        enum: ["student", "working", "any"],
        default: "any",
      },
    },

    // ---- Verification ----
    // select: false — documents never come back on a normal .find()/.findById()
    // unless a query explicitly does .select('+documents'). This is enforced
    // independently of the toJSON strip below, so it also protects .lean()
    // queries, which bypass toJSON entirely.
    documents: {
      type: [documentSchema],
      select: false,
    },
    idVerified: {
      type: Boolean,
      default: false, // set true only when at least one document is "verified"
    },

    isComplete: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "paused", "matched", "closed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

roommateProfileSchema.index({ "searchArea.location": "2dsphere" });
roommateProfileSchema.index({ intent: 1, status: 1, "searchArea.city": 1 });

roommateProfileSchema.pre("save", function () {
  if (this.isModified("documents")) {
    this.idVerified = this.documents.some(
      (d) => d.verificationStatus === "verified",
    );
  }

  if (
    this.isModified("bio") ||
    this.isModified("habits") ||
    this.isModified("gender")
  ) {
    const h = this.habits || {};
    this.isComplete = Boolean(
      this.gender &&
      this.occupation &&
      h.smoking &&
      h.drinking &&
      h.foodPreference &&
      h.cleanlinessLevel,
    );
  }
});

/**
 * Compares this profile's `habits` against another profile's `lookingFor`
 * to produce a 0-100 compatibility score. Rule-based; swap for a weighted
 * version later without touching the schema.
 */
roommateProfileSchema.methods.matchScoreAgainst = function (otherProfile) {
  const wants = otherProfile.lookingFor;
  const mine = this.habits;
  if (!wants || !mine) return null;

  const fields = ["smoking", "drinking", "nightlifeFriendly"];
  let total = 0;
  let matched = 0;

  fields.forEach((field) => {
    if (!wants[field] || wants[field] === "no_preference") return;
    total += 1;
    if (wants[field] === mine[field]) matched += 1;
  });

  if (wants.foodPreference && wants.foodPreference !== "any") {
    total += 1;
    if (wants.foodPreference === mine.foodPreference) matched += 1;
  }

  if (total === 0) return 100;
  return Math.round((matched / total) * 100);
};

// Belt-and-suspenders: even though `documents` has select: false, strip it
// again here in case a future query explicitly opts it back in with
// .select('+documents') for an admin view but still ends up serializing
// through a shared public-facing response path by mistake.
roommateProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.documents;
  return obj;
};

const RoommateProfile = mongoose.model(
  "RoommateProfile",
  roommateProfileSchema,
);

export default RoommateProfile;
