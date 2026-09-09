/**
 * One-time repair script for RoommateProfile docs whose `searchArea.location`
 * is a bare `{ type: "Point" }` with no `coordinates` array. Those docs make
 * the `searchArea.location` 2dsphere index impossible to build/query and blow
 * up writes with:
 *   "Can't extract geo keys … Point must be an array or object,
 *    instead got type missing."
 *
 * Fix: rewrite `searchArea.location` to a valid GeoJSON Point. When the doc has
 * no usable coordinates we fall back to [0, 0] (the schema default). If the
 * searchArea itself is missing/null but the intent needs one, we leave it
 * alone — only the broken Point is repaired.
 *
 * Usage:
 *   node scripts/repair-search-area.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import RoommateProfile from "../models/RoommateProfile.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";

function hasValidCoords(location) {
  const coords = location?.coordinates;
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((c) => typeof c === "number" && Number.isFinite(c))
  );
}

async function repairSearchArea() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");

    // Find every doc that has a searchArea.location with missing/invalid coords.
    const brokenDocs = await RoommateProfile.find({
      "searchArea.location": { $exists: true },
      $or: [
        { "searchArea.location.coordinates": { $exists: false } },
        { "searchArea.location.coordinates": { $eq: null } },
        {
          "searchArea.location.coordinates": {
            $not: { $type: "array" },
          },
        },
        {
          "searchArea.location.coordinates": {
            $not: { $size: 2 },
          },
        },
      ],
    }).lean();

    console.log(
      `\n🔍 Found ${brokenDocs.length} RoommateProfile docs with a broken searchArea.location\n`,
    );

    if (brokenDocs.length === 0) {
      console.log("✨ Nothing to repair. All docs have valid geo coordinates.");
      await mongoose.disconnect();
      return;
    }

    let repaired = 0;
    let errors = 0;

    for (const doc of brokenDocs) {
      try {
        const location = doc.searchArea?.location;
        const fallback = hasValidCoords(location)
          ? location.coordinates
          : [0, 0];

        await RoommateProfile.updateOne(
          { _id: doc._id },
          {
            $set: {
              "searchArea.location": {
                type: "Point",
                coordinates: fallback,
              },
            },
          },
        );

        repaired++;
        console.log(
          `  ✓ ${doc._id} — set coordinates to [${fallback.join(", ")}]`,
        );
      } catch (err) {
        errors++;
        console.error(`  ✗ ${doc._id} — ${err.message}`);
      }
    }

    console.log(`\n✅ Repair complete:`);
    console.log(`   • ${repaired} documents fixed`);
    console.log(`   • ${errors} documents failed`);
  } catch (err) {
    console.error("\n❌ Repair failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

repairSearchArea();
