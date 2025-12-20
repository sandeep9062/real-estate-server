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
      required: true,
    },
    image: {
      type: String,
    },
    bookedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    favProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    ownedProperties: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
