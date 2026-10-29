// Migrates existing RoommateProfile documents from the OLD schema to the NEW
// schema so the flatmates feature works end-to-end.
//
// OLD schema:   intent ("has_room" | "seeking_room"), user is null/undefined.
// NEW schema:   type ("have_room" | "no_room"), user = User _id.
//
// For each profile we find the linked User through User.roommateProfile and
// rewrite the profile accordingly (idempotent — safe to re-run).
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

  const profiles = await RoommateProfile.find({}).lean();
  let migrated = 0;
  let skipped = 0;

  for (const profile of profiles) {
    // Already migrated?
    if (profile.user && profile.type) {
      skipped++;
      continue;
    }

    // Find the linked user (User stores roommateProfile = this profile's _id)
    // or fall back to scanning users that point to this profile.
    const linkedUser = await User.findOne({ roommateProfile: profile._id }).lean();
    if (!linkedUser) {
      console.warn(`⏭️  Skipping profile ${profile._id} — no linked user found`);
      skipped++;
      continue;
    }

    // Decide type from intent if present, otherwise from roomFlat presence.
    let type = profile.type;
    if (!type) {
      const intent = profile.intent;
      type = intent === "has_room" ? "have_room" : "no_room";
      if (!type) type = profile.roomFlat ? "have_room" : "no_room";
    }

    const update = {
      user: linkedUser._id,
      type,
    };

    // Clear legacy fields that no longer exist in the new schema.
    if (profile.intent != null && typeof profile.intent !== "undefined") {
      update["$unset"] = { intent: "" };
    }

    await RoommateProfile.updateOne({ _id: profile._id }, { $set: update });
    console.log(`✅ Migrated ${profile._id}: type=${type}, user=${linkedUser._id}`);
    migrated++;
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
