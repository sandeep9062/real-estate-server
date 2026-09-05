/**
 * Reset a test user so the signup/role-selection/phone-capture flows can be
 * re-tested without creating new accounts.
 *
 * Usage:
 *   node scripts/reset-test-user.js <email> [--keep-profiles]
 *
 * What it does (against the REAL dev database — use a dedicated test email!):
 *   1. Sets user.role back to "user" and user.phone to ""
 *   2. Deletes the user's Agent and Landlord profile docs (so select-role
 *      exercises fresh creation again). Pass --keep-profiles to leave them —
 *      useful for re-testing the idempotent path where a profile already
 *      exists while role is "user".
 *
 * It does NOT touch sessions/refresh tokens — the user stays logged in, but
 * the frontend caches the old user object in localStorage, so either log out
 * and back in, or clear localStorage (see TESTING-NOTES below the script).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const email = process.argv[2]?.toLowerCase();
const keepProfiles = process.argv.includes("--keep-profiles");

if (!email) {
  console.error("Usage: node scripts/reset-test-user.js <email> [--keep-profiles]");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";

async function main() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_DB not set in environment. Check backend/.env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  const User = (await import("../models/User.js")).default;
  const Agent = (await import("../models/Agent.js")).default;
  const Landlord = (await import("../models/Landlord.js")).default;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("\n— Before —");
  console.log(`  _id:     ${user._id}`);
  console.log(`  name:    ${user.name}`);
  console.log(`  role:    ${user.role}`);
  console.log(`  phone:   ${user.phone || "(empty)"}`);
  console.log(`  google:  ${user.googleId ? "yes" : "no"}`);

  // 1. Reset role + phone
  user.role = "user";
  user.phone = "";
  await user.save();

  // 2. Remove profile docs (unless asked to keep them)
  if (!keepProfiles) {
    const a = await Agent.deleteMany({ userID: user._id });
    const l = await Landlord.deleteMany({ userID: user._id });
    console.log(`\n— Deleted profile docs —`);
    console.log(`  agents: ${a.deletedCount}, landlords: ${l.deletedCount}`);
  } else {
    const a = await Agent.countDocuments({ userID: user._id });
    const l = await Landlord.countDocuments({ userID: user._id });
    console.log(`\n— Kept profile docs (--keep-profiles) —`);
    console.log(`  agents: ${a}, landlords: ${l}`);
  }

  console.log("\n— After —");
  console.log(`  role:   ${user.role}`);
  console.log(`  phone:  ${user.phone || "(empty)"}`);

  console.log(
    "\n✅ Reset complete. Frontend reminder: the browser caches the old user in" +
      "\n   localStorage — log out & back in, or clear these keys in DevTools:" +
      "\n   localStorage.removeItem('user');" +
      "\n   localStorage.removeItem('pb_skipped_role_selection');  // if testing the skip path",
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
