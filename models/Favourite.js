import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  {
    timestamps: true, // Gives you 'createdAt' for "Recently Liked" sorting
  },
);

// High-performance index for "Check if I liked this" and "List all my likes"
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });
// Index for "How many people liked this property?"
favoriteSchema.index({ property: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
