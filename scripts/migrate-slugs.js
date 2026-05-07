/**
 * One-time migration script to generate slugs for all properties that are missing one.
 *
 * Usage:
 *   node scripts/migrate-slugs.js
 *
 * This script connects to MongoDB, iterates through every Property document
 * that has no `slug` field, generates a URL-friendly slug from the `title`,
 * and saves it back.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import Property from "../models/Property.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";

async function migrateSlugs() {
  try {
    // 1. Connect
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");

    // 2. Find all properties where slug is missing
    const missingSlugDocs = await Property.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    }).lean();

    console.log(
      `\n📦 Found ${missingSlugDocs.length} properties without a slug\n`,
    );

    if (missingSlugDocs.length === 0) {
      console.log("✨ Nothing to migrate. All properties already have a slug.");
      await mongoose.disconnect();
      return;
    }

    // 3. Generate & update slugs in batches
    let updated = 0;
    let errors = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < missingSlugDocs.length; i += BATCH_SIZE) {
      const batch = missingSlugDocs.slice(i, i + BATCH_SIZE);
      const operations = [];

      for (const doc of batch) {
        if (!doc.title || typeof doc.title !== "string") {
          console.warn(`  ⚠️  Skipping ${doc._id} — no valid title`);
          errors++;
          continue;
        }

        // Generate a URL-friendly slug from the title
        let baseSlug = slugify(doc.title, {
          lower: true, // lowercase
          strict: true, // strip special characters
          trim: true,
        });

        // Append a short unique suffix to avoid collisions
        // (the Property model has a unique sparse index on slug)
        const suffix = doc._id.toString().slice(-6);
        const slug = `${baseSlug}-${suffix}`;

        operations.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { slug } },
          },
        });
      }

      if (operations.length > 0) {
        const result = await Property.bulkWrite(operations);
        updated +=
          result.modifiedCount ?? result.upsertedCount ?? operations.length;
        console.log(
          `  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1} — processed ${operations.length} documents`,
        );
      }
    }

    console.log(`\n✅ Migration complete:`);
    console.log(`   • ${updated} slugs generated and saved`);
    console.log(`   • ${errors} documents skipped (no title)`);
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

migrateSlugs();
