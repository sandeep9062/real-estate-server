import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
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
favouriteSchema.index({ user: 1, property: 1 }, { unique: true });
// Index for "How many people liked this property?"
favouriteSchema.index({ property: 1 });

const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite;
