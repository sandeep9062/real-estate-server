/**
 * One-time migration script to bring existing user phone numbers into the
 * required E.164 format (WITH country code, e.g. "+919876543210").
 *
 * Usage:
 *   node scripts/migrate-phones-to-e164.js [--apply]
 *
 * Default is a dry-run: it only reports what it would change. Pass --apply
 * to write the changes.
 *
 * The app's default country is India ("defaultCountry=IN" on every phone
 * input), so bare 10-digit numbers are assumed to be Indian (+91) numbers.
 * Numbers that cannot be normalized are left untouched and reported, and
 * duplicate phones are reported (they must be resolved manually before the
 * new unique index can be created).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { normalizePhone } from "../utils/phone.js";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const MONGO_URI = process.env.MONGO_DB;
const DB_NAME = "PropertyBulbul";

// Phone values that can be safely converted with the +91 assumption
const BARE_INDIAN_RE = /^(\+?91)?\d{10}$/;

function toE164(raw) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[\s\-().]/g, "");
  if (BARE_INDIAN_RE.test(cleaned)) {
    // 10 digits, or 12 digits starting with 91
    return cleaned.startsWith("91") ? `+${cleaned}` : `+91${cleaned}`;
  }
  // Anything else — only accept it if it is already valid E.164
  return normalizePhone(raw);
}

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`✅ Connected to MongoDB${APPLY ? " (APPLY mode)" : " (dry-run)"}`);

    const users = await User.find({}).lean();
    console.log(`📦 Found ${users.length} users\n`);

    let updated = 0;
    let skipped = 0;
    let missing = 0;
    const duplicates = new Map();

    for (const user of users) {
      const raw = user.phone;

      if (!raw || typeof raw !== "string" || !raw.trim()) {
        // Phone is now required in the schema — these users must be fixed
        // manually (e.g. via the phone-capture flow) before they save again.
        console.warn(`  ⚠️  ${user.email} — has NO phone number`);
        missing++;
        continue;
      }

      const normalized = toE164(raw);
      if (!normalized) {
        console.warn(`  ⚠️  ${user.email} — cannot normalize "${raw}" (left untouched)`);
        skipped++;
        continue;
      }

      if (normalized !== raw) {
        console.log(`  ✓ ${user.email}: "${raw}" → "${normalized}"`);
        if (APPLY) {
          await User.updateOne({ _id: user._id }, { $set: { phone: normalized } });
        }
        updated++;
      }

      // Track duplicates after normalization
      duplicates.set(normalized, [...(duplicates.get(normalized) || []), user.email]);
    }

    console.log(`\n✅ Migration ${APPLY ? "complete" : "(dry-run) — re-run with --apply to write"}:`);
    console.log(`   • ${updated} phones ${APPLY ? "updated" : "would be updated"} to E.164`);
    console.log(`   • ${skipped} phones could not be normalized (left untouched)`);
    console.log(`   • ${missing} users have no phone number (must be fixed manually)`);

    const dupes = [...duplicates.entries()].filter(
      ([, emails]) => emails.length > 1,
    );
    if (dupes.length) {
      console.log(`\n❌ ${dupes.length} duplicate phone number(s) found — resolve these BEFORE deploying, the unique index cannot be created while duplicates exist:`);
      for (const [phone, emails] of dupes) {
        console.log(`   • ${phone}: ${emails.join(", ")}`);
      }
    } else {
      console.log("\n✨ No duplicate phone numbers detected.");
    }
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

migrate();
