// Journal content normalizer (dry-run by default).
//
// BACK UP FIRST: run `mongodump` (or otherwise back up the `journals`
// collection / PropertyBulbul database) before running with --apply.
//
// Usage:
//   node scripts/normalizeJournals.js            # dry-run: report only
//   node scripts/normalizeJournals.js --apply    # write normalized content
//
// What it does:
// - Loads every journal, applies normalizeMarkdown() from
//   ../utils/markdown.js, and reports how many documents WOULD change.
// - In dry-run it prints each changed slug plus a short before/after
//   snippet of the first change, and writes nothing.
// - With --apply it saves the normalized content back.
// - It NEVER touches slugs (changing live URLs would break SEO).
// - It NEVER unescapes backslash-pipe (valid inside GFM table cells).
// - It logs slugs whose content has lines starting with a backslash-pipe
//   or lines that look like flattened single-line tables, for manual review.
import mongoose from "mongoose";
import dotenv from "dotenv";
import Journal from "../models/Journal.js";
import { normalizeMarkdown } from "../utils/markdown.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";
const APPLY = process.argv.includes("--apply");
const SNIPPET_CHARS = 120;

function firstDiffSnippet(before, after) {
  const len = Math.max(before.length, after.length);
  let start = 0;
  while (start < len && before[start] === after[start]) start += 1;
  let endBefore = before.length;
  let endAfter = after.length;
  while (
    endBefore > start &&
    endAfter > start &&
    before[endBefore - 1] === after[endAfter - 1]
  ) {
    endBefore -= 1;
    endAfter -= 1;
  }
  const windowStart = Math.max(0, start - 20);
  const beforeSlice = before.slice(windowStart, endBefore).slice(0, SNIPPET_CHARS);
  const afterSlice = after.slice(windowStart, endAfter).slice(0, SNIPPET_CHARS);
  return { beforeSlice, afterSlice };
}

function oneLine(value) {
  return String(value).split("\n").join(" / ");
}

// Heuristic: true when the content likely contains a broken/flattened table
// that needs a human to review it.
function looksLikeBrokenTable(content) {
  const lines = String(content).split("\n");
  const BS = String.fromCharCode(92);
  for (const line of lines) {
    const trimmed = line.trim();
    // Escaped pipe at the start of a line: a table row whose leading pipe
    // was escaped by the old editor (renders literally, never as a table).
    if (trimmed.startsWith(BS + "|")) return true;
  }
  // A long single line stuffed with 3+ pipes: a table flattened into one
  // paragraph (no row breaks for the markdown parser to work with).
  for (const line of lines) {
    const pipes = line.split("|").length - 1;
    if (line.length > 200 && pipes >= 3 && !line.includes("\n")) return true;
  }
  return false;
}

async function normalizeJournals() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_DB env var.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("Connected to MongoDB");

    const journals = await Journal.find({}).select("slug content").lean();
    console.log("Found " + journals.length + " journals");
    console.log(APPLY ? "Mode: APPLY (writing changes)" : "Mode: DRY-RUN (no writes)");

    let wouldChange = 0;
    let written = 0;
    const reviewSlugs = [];

    for (const doc of journals) {
      const before = typeof doc.content === "string" ? doc.content : "";
      const after = normalizeMarkdown(before);
      if (looksLikeBrokenTable(before)) {
        reviewSlugs.push(doc.slug);
      }
      if (after === before) continue;
      wouldChange += 1;
      const snippet = firstDiffSnippet(before, after);
      console.log("---");
      console.log("slug: " + doc.slug);
      console.log("before: " + oneLine(snippet.beforeSlice));
      console.log("after:  " + oneLine(snippet.afterSlice));
      if (APPLY) {
        // timestamps:false keeps updatedAt (and the sitemap lastmod derived
        // from it) untouched: this is a formatting-only change.
        await Journal.updateOne(
          { _id: doc._id },
          { $set: { content: after } },
          { timestamps: false }
        );
        written += 1;
      }
    }

    console.log("---");
    console.log("Documents that would change: " + wouldChange);
    if (APPLY) console.log("Documents written: " + written);
    else console.log("Dry-run: nothing written. Re-run with --apply to write.");

    if (reviewSlugs.length) {
      console.log("Slugs needing manual table review (" + reviewSlugs.length + "):");
      for (const slug of reviewSlugs) console.log(" - " + slug);
    } else {
      console.log("No broken-table patterns detected.");
    }
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

normalizeJournals();
