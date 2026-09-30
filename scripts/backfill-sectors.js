/**
 * Backfill `location.sector` for Property docs where it is empty but the
 * sector can be read from the listing itself.
 *
 * Why this exists: the frontend's programmatic SEO pages (sector landing
 * pages, /sectors directory links) group listings ONLY by the structured
 * `location.sector` field, while map pins also fall back to parsing the
 * title. Most active listings have an empty structured sector even though
 * "Sector N" is right there in the title/address — so pins show
 * "page coming soon". Backfilling aligns the data so both views agree.
 *
 * Sources checked per listing, in order:
 *   1. `location.sector` already set  -> skipped (never overwritten)
 *   2. "Sector N" / "Sector-N" in `title` (first match)
 *   3. "Sector N" / "Sector-N" in `location.address` (first match)
 *   4. "Phase N" in title/address for Mohali listings (stored as "Phase N")
 *
 * Only sets the field when the sector number is in the known range for the
 * listing's city (Chandigarh 1-60 excl. 13, Mohali 55-125 excl. 13,
 * Panchkula 1-32) so garbage like "Sector 102, Mohali" or "Sector 1000"
 * can never create a bogus sector page.
 *
 * Safe to re-run (idempotent): docs that already have a sector are skipped.
 * Supports --dry-run (default) and --apply.
 *
 * Usage:
 *   node scripts/backfill-sectors.js            # dry run, prints plan
 *   node scripts/backfill-sectors.js --apply    # writes to MongoDB
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "../models/Property.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";
const APPLY = process.argv.includes("--apply");

const RANGES = {
  chandigarh: [1, 60],
  mohali: [55, 135],
  panchkula: [1, 32],
};

function cityKey(city) {
  return String(city || "").trim().toLowerCase();
}

/** "Sector 40" -> 40, "Sector-35" -> 35, "Sec 22", "Sec-49" -> same, else null. */
function sectorNumberFromText(text) {
  const m = String(text || "").match(/\bsec(?:tor)?\s*,?\s*-?\s*(\d{1,3})/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 1 && n <= 200 ? n : null;
}

/** "Phase 7" -> 7, else null (Mohali phases double as sector anchors). */
function phaseNumberFromText(text) {
  const m = String(text || "").match(/phase\s*-?\s*(\d{1,3})/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 1 && n <= 200 ? n : null;
}

function inRange(city, n) {
  const range = RANGES[cityKey(city)];
  if (!range) return false;
  if (n === 13) return false; // Sector 13 does not exist in the tricity grid
  return n >= range[0] && n <= range[1];
}

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_DB is not set in the environment.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  const candidates = await Property.find({
    isActive: { $ne: false },
    deletedAt: null,
    $or: [
      { "location.sector": { $exists: false } },
      { "location.sector": null },
      { "location.sector": "" },
    ],
  }).lean();

  console.log(`\nFound ${candidates.length} active listings with empty location.sector\n`);

  const plan = [];
  const skippedNoMatch = [];
  const skippedOutOfRange = [];

  for (const doc of candidates) {
    const title = doc.title || "";
    const address = doc.location?.address || "";
    const city = doc.location?.city || "";

    let value = null;
    const sectorNum = sectorNumberFromText(title) ?? sectorNumberFromText(address);
    if (sectorNum !== null) {
      if (inRange(city, sectorNum)) {
        value = `Sector ${sectorNum}`;
      } else {
        skippedOutOfRange.push({ id: doc._id, city, title, n: sectorNum });
        continue;
      }
    } else if (cityKey(city) === "mohali") {
      // Mohali-only: "Phase N" is a real locality anchor there.
      const phaseNum = phaseNumberFromText(title) ?? phaseNumberFromText(address);
      if (phaseNum !== null && inRange(city, phaseNum)) {
        value = `Phase ${phaseNum}`;
      } else if (phaseNum !== null) {
        skippedOutOfRange.push({ id: doc._id, city, title, n: phaseNum });
        continue;
      }
    }

    if (!value) {
      skippedNoMatch.push({ id: doc._id, city, title });
      continue;
    }
    plan.push({ id: doc._id, city, title, value });
  }

  console.log(`Would backfill: ${plan.length}`);
  for (const p of plan) {
    console.log(`  ${p.id} [${p.city}] -> "${p.value}" | ${p.title.slice(0, 70)}`);
  }
  console.log(`\nNo sector found in title/address: ${skippedNoMatch.length}`);
  for (const s of skippedNoMatch) {
    console.log(`  ${s.id} [${s.city}] | ${String(s.title).slice(0, 70)}`);
  }
  console.log(`\nSector out of range for city (left alone): ${skippedOutOfRange.length}`);
  for (const s of skippedOutOfRange) {
    console.log(`  ${s.id} [${s.city}] n=${s.n} | ${String(s.title).slice(0, 70)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only — re-run with --apply to write these changes.");
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  let errors = 0;
  for (const p of plan) {
    try {
      // Guard the write: only touch docs whose sector is STILL empty.
      const res = await Property.updateOne(
        {
          _id: p.id,
          $or: [
            { "location.sector": { $exists: false } },
            { "location.sector": null },
            { "location.sector": "" },
          ],
        },
        { $set: { "location.sector": p.value } },
      );
      if (res.modifiedCount === 1) updated += 1;
    } catch (err) {
      errors += 1;
      console.error(`  ✗ ${p.id} — ${err.message}`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${errors} failed.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Backfill failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
