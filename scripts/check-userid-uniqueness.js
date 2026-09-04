/**
 * Pre-flight check for adding `unique: true` to Agent.userID and Landlord.userID.
 *
 * Usage:
 *   node scripts/check-userid-uniqueness.js
 *
 * MongoDB unique indexes reject duplicates AND (for non-sparse indexes) a second
 * document with a null/missing value. Before the schema change takes effect at
 * app startup (mongoose auto-indexes), this script reports:
 *
 *   1. Duplicate non-null userID values in `agents` and `landlords`
 *   2. Documents with missing/null userID (only possible on `landlords` today,
 *      since Agent.userID is already required)
 *
 * Exit code 0 = safe to apply the index, 1 = cleanup needed.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";

async function checkCollection(collectionName) {
  const collection = mongoose.connection.collection(collectionName);

  // Group by userID, counting docs per value. Null/missing userIDs group under `null`.
  const groups = await collection
    .aggregate([{ $group: { _id: "$userID", count: { $sum: 1 } } }])
    .toArray();

  const duplicates = groups.filter((g) => g._id !== null && g.count > 1);
  const nullGroup = groups.find((g) => g._id === null);
  const nullCount = nullGroup ? nullGroup.count : 0;

  return { duplicates, nullCount };
}

async function main() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_DB not set in environment. Check backend/.env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB\n");

  let clean = true;

  for (const name of ["agents", "landlords"]) {
    console.log(`--- ${name} ---`);
    const { duplicates, nullCount } = await checkCollection(name);

    if (duplicates.length === 0) {
      console.log("  ✅ No duplicate userID values found.");
    } else {
      clean = false;
      console.log(
        `  ❌ ${duplicates.length} duplicate userID value(s) found — these WILL break the unique index:`,
      );
      for (const dup of duplicates) {
        const docs = await mongoose.connection
          .collection(name)
          .find({ userID: dup._id })
          .project({ name: 1, email: 1, phone: 1, createdAt: 1 })
          .toArray();
        console.log(`  userID ${dup._id} (${dup.count} docs):`);
        for (const doc of docs) {
          console.log(
            `    - _id: ${doc._id}, name: ${doc.name || "(none)"}, email: ${
              doc.email || "(none)"
            }, phone: ${doc.phone || "(none)"}, createdAt: ${
              doc.createdAt?.toISOString?.() || doc.createdAt
            }`,
          );
        }
      }
      console.log(
        "     👉 Fix: keep the newest doc (or the one linked to a real User) and delete/merge the rest before deploying.",
      );
    }

    if (nullCount > 0) {
      if (name === "agents") {
        clean = false;
        console.log(
          `  ⚠️  Unexpected: ${nullCount} agent doc(s) with missing/null userID (schema says required — possible legacy data).`,
        );
      } else {
        clean = false;
        console.log(
          `  ⚠️  ${nullCount} landlord doc(s) with missing/null userID. A unique NON-sparse index allows only ONE doc with null userID — these must be cleaned up or linked to their User before deploying.`,
        );
        const orphans = await mongoose.connection
          .collection("landlords")
          .find({
            $or: [
              { userID: { $exists: false } },
              { userID: null },
            ],
          })
          .project({ name: 1, email: 1, phone: 1, createdAt: 1 })
          .limit(20)
          .toArray();
        for (const doc of orphans) {
          console.log(
            `    - _id: ${doc._id}, name: ${doc.name || "(none)"}, email: ${
              doc.email || "(none)"
            }, phone: ${doc.phone || "(none)"}, createdAt: ${
              doc.createdAt?.toISOString?.() || doc.createdAt
            }`,
          );
        }
        if (nullCount > 20) console.log(`    ... and ${nullCount - 20} more`);
        console.log(
          "     👉 Fix options: (a) link each doc to its User by email/phone, (b) delete stale docs, or (c) make the index sparse — but note a sparse index won't enforce uniqueness for future null-userID docs.",
        );
      }
    }
    console.log("");
  }

  await mongoose.disconnect();

  if (clean) {
    console.log("✅ SAFE: no conflicting data. The unique indexes can be applied.");
    process.exit(0);
  } else {
    console.log("❌ NOT SAFE: clean up the data above before applying the indexes.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
