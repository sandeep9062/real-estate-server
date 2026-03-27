import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Booking from "./Booking.js";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Optional for OAuth users
    },
    role: {
      type: String,
      enum: ["user", "admin", "agent", "landlord", "builder"],
      default: "user",
    },
    phone: {
      type: String,
    },
    image: {
      type: String,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        userAgent: {
          type: String,
        },
        ipAddress: {
          type: String,
        },
      },
    ],
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    bookedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    favProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    ownedProperties: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
// Note: email and googleId already have unique: true in schema, so we only add refreshTokens index
userSchema.index({ "refreshTokens.token": 1 });

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If user has no password (OAuth user), return false
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre("save", async function () {
  // Skip if password is not modified or not provided (OAuth users)
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to add refresh token
userSchema.methods.addRefreshToken = async function (
  hashedToken,
  userAgent,
  ipAddress,
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  this.refreshTokens.push({
    token: hashedToken,
    expiresAt,
    userAgent,
    ipAddress,
  });

  // Limit the number of refresh tokens per user (max 10 devices)
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }

  return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = async function (hashedToken) {
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.token !== hashedToken,
  );
  return this.save();
};

// Method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = async function () {
  this.refreshTokens = [];
  this.tokenVersion += 1;
  return this.save();
};

// Method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = async function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.expiresAt > now);
  return this.save();
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");

  if (!user) {
    return null;
  }

  if (!user.password) {
    return null;
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return null;
  }

  return user;
};

// Transform output - remove sensitive fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.googleId;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
