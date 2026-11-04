// Publish existing journals missing a status so they appear on the public /journal page.
//
// Why this exists: the Journal model previously defaulted `status` to "draft",
// and many existing documents have no `status` field at all (status === null).
// The public GET /api/v1/journals endpoint only returns
// { status: "published", deletedAt: null }, so journals with missing/null
// status are invisible on /journal.
//
// The model default has since been changed to "published" (server/models/Journal.js),
// so NEW journals are fine — this script backfills existing ones.
//
// Safe to re-run (idempotent): already-published and archived docs are skipped.
//
// Usage:
//   node scripts/publish-journals.js            # dry-run: report only
//   node scripts/publish-journals.js --apply    # write to MongoDB
//
// BACK UP FIRST: run `mongodump` (or otherwise back up the `journals`
// collection / PropertyBulbul database) before running with --apply.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Journal from "../models/Journal.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";
const APPLY = process.argv.includes("--apply");

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_DB is not set in the environment.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  // Journals missing a published status (null, missing, or draft) are hidden
  // from /journal because the public endpoint requires status === "published".
  const unpublished = await Journal.find({
    deletedAt: null,
    $or: [
      { status: { $exists: false } },
      { status: null },
      { status: "" },
      { status: "draft" },
    ],
  })
    .select("_id title slug status createdAt")
    .lean();

  console.log(`\nFound ${unpublished.length} journal(s) without a published status.`);
  console.log(APPLY ? "Mode: APPLY (writing changes)" : "Mode: DRY-RUN (no writes)\n");

  for (const d of unpublished) {
    console.log(`  ${d._id} [${d.status || "<missing>"}] ${d.slug || "<no-slug>"} | ${d.title}`);
  }

  if (!APPLY) {
    console.log("\nDry run only — re-run with --apply to publish these journals.");
    await mongoose.disconnect();
    return;
  }

  const result = await Journal.updateMany(
    {
      deletedAt: null,
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: "" },
        { status: "draft" },
      ],
    },
    { $set: { status: "published" } }
  );

  console.log(`\nDone: ${result.modifiedCount} journal(s) published, ${result.matchedCount} matched.`);
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch(async (err) => {
  console.error("Publish failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
