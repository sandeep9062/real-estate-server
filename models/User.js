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
    },
    role: {
      type: String,
      enum: ["user", "admin", "agent", "landlord", "builder"], // you can add more
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    phone: {
      type: String,
    },
    password: {
      type: String,
      // Optional for OAuth/Better Auth users
    },
    image: {
      type: String,
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
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  // If user has no password (OAuth user), return false
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function () {
  // Skip if password is not modified or not provided (OAuth users)
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
