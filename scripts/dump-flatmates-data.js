// Dumps the actual RoommateProfile and User documents from the flatmates DB
// so we can see exactly what data exists and how (or if) they are linked.
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import RoommateProfile from "../models/RoommateProfile.js";
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_DB;
if (!MONGO_URI) {
  console.error("❌ MONGO_DB not set");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: "PropertyBulbul" });

  const rp = await RoommateProfile.find({}).lean();
  console.log("=== ROOMMATE_PROFILES (" + rp.length + ") ===");
  for (const p of rp) {
    console.log(
      JSON.stringify({
        _id: p._id,
        type: p.type,
        intent: p.intent,
        user: p.user?.toString?.() ?? p.user,
        roomFlat: p.roomFlat?.toString?.() ?? p.roomFlat,
        hasRoomFlat: !!p.roomFlat,
        hasUser: !!p.user,
      }),
    );
  }

  const users = await User.find({}).lean();
  console.log("\n=== USERS (" + users.length + ") ===");
  for (const u of users) {
    console.log(
      JSON.stringify({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        roommateProfile: u.roommateProfile?.toString?.() ?? u.roommateProfile,
      }),
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ FAILED:", err.message);
  process.exit(1);
});