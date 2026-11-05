// Journal status checker.
// Reports the publishing status of all journals for admin review.
//
// Usage:
//   node scripts/check-journal-status.js
//
// What it does:
//   - Counts journals by `status`: published, draft, archived, and any docs
//     that have NO `status` field at all (legacy documents).
//   - Separates deleted vs non-deleted journals.
//   - For published journals, reports `publishedAt` coverage and prints the
//     newest and oldest published docs.
//   - For each status bucket, prints total count, newest doc, and a few sample
//     slugs so the admin gets a clear picture at a glance.
//
// Read-only: never writes to MongoDB.
//
// Output can also be piped to a file or fed to `jq`:
//   node scripts/check-journal-status.js --json | jq .

import mongoose from "mongoose";
import dotenv from "dotenv";
import Journal from "../models/Journal.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";
const JSON_OUTPUT = process.argv.includes("--json");

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_DB is not set in the environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("Connected to MongoDB");

    // Per-status counts (only non-deleted journals).
    const statusCounts = await Journal.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          newest: { $max: "createdAt" },
          oldest: { $min: "createdAt" },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    // Definitely published state docs (covers missing/null status too).
    const missingStatus = await Journal.countDocuments({
      deletedAt: null,
      $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
    });

    const totalActive = await Journal.countDocuments({ deletedAt: null });
    const totalDeleted = await Journal.countDocuments({ deletedAt: { $ne: null } });

    // Per-status detail for listing sample slugs.
    const sampleByStatus = {};
    for (const doc of await Journal.find({ deletedAt: null }).select("slug title status createdAt").lean().sort({ createdAt: -1 })) {
      const bucket = doc.status || "(missing)";
      if (!sampleByStatus[bucket]) sampleByStatus[bucket] = [];
      if (sampleByStatus[bucket].length < 3) sampleByStatus[bucket].push(doc);
    }

    // Handle legacy statuses not in the enum.
    const reportedStatuses = new Set(statusCounts.map((c) => c._id));
    for (const doc of await Journal.find({ deletedAt: null, status: { $exists: false } }).limit(5).lean()) {
      reportedStatuses.add("<absent>");
    }

    const output = {
      database: DB_NAME,
      totals: { active: totalActive, deleted: totalDeleted, total: totalActive + totalDeleted },
      statusCounts: statusCounts.map((c) => ({ status: c._id, count: c.count, newest: c.newest, oldest: c.oldest })),
      missingStatus,
      samples: sampleByStatus,
    };

    if (JSON_OUTPUT) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(`\nPropertyBulbul — Journal Status Report\n`);

      console.log(`Total journals: ${output.totals.total}`);
      console.log(`  Active (deletedAt = null): ${output.totals.active}`);
      console.log(`  Deleted (deletedAt set):   ${output.totals.deleted}`);
      console.log(`  Missing/no status field:   ${missingStatus}`);
      console.log();

      for (const bucket of ["published", "draft", "archived", "<absent>", null]) {
        if (bucket === null) continue;
        const entry = output.statusCounts.find((c) => c.status === bucket);
        if (!entry) continue;
        const label =
          bucket === "<absent>" ? "No status field (legacy)" :
          bucket === "published" ? "Published" :
          bucket === "draft" ? "Draft" :
          bucket === "archived" ? "Archived" : String(bucket);
        console.log(`${label}: ${entry.count}`);
        console.log(`  Newest: ${entry.newest} | Oldest: ${entry.oldest}`);
        for (const s of (output.samples[bucket] || [])) {
          console.log(
            `  - [${s.status || "<missing>"}] ${s.slug || "<no-slug>"} | ${s.title || "(no title)"} (${s.createdAt})`,
          );
        }
        console.log();
      }

      if (missingStatusCount > 0) {
        const legacy = await Journal.find({ deletedAt: null, $or: [{ status: { $exists: false } }, { status: null }, { status: "" }] })
          .select("_id slug title status createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        console.log(`Legacy / no-status journals (first 10):`);
        for (const doc of legacy) {
          console.log(`  - ${doc._id} [${doc.status || "<missing>"}] ${doc.slug || "<no-slug>"} | ${doc.title || "(no title)"}`);
        }
        console.log(`  ... and ${missingStatus - legacy.length} more`);
        console.log();
      }

      const publishedWithPublishedAt = await Journal.countDocuments({ deletedAt: null, status: "published", publishedAt: { $exists: true, $ne: null } });
      const publishedWithoutPublishedAt = await Journal.countDocuments({ deletedAt: null, status: "published", publishedAt: { $exists: false } });
      console.log(`Published journal consistency:`);
      console.log(`  published + has publishedAt: ${publishedWithPublishedAt}`);
      console.log(`  published + missing publishedAt (will auto-set on save): ${publishedWithoutPublishedAt}`);
      console.log();
    }
  } catch (err) {
    console.error("Status check failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();

export { main };
