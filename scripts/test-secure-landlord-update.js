/**
 * Smoke test for the secured PUT /api/landlords/:id endpoint.
 *
 * Covers the two-tier permission model:
 *  - 401 with no auth
 *  - 404 for a nonexistent landlord id
 *  - 403 for a non-owner (another landlord / a plain user) editing someone
 *    else's doc
 *  - 403 for an owner sending an admin-only field (identity/stats/tax/SEO)
 *  - 200 for the owner updating their own allowed (/me) fields — and the
 *    forbidden fields must NOT have been applied
 *  - 200 for an admin updating any landlord's doc (including admin-only fields)
 *
 * Throwaway local MongoDB; REAL landlord routes over HTTP with REAL JWT auth.
 * Usage: node scripts/test-secure-landlord-update.js
 */
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_secure_landlord_smoke";
const DB_NAME = "pb_secure_landlord_smoke";

process.env.JWT_ACCESS_SECRET = "smoke-test-secret";
process.env.RESEND_API_KEY = "smoke-test-key"; // never used
process.env.NODE_ENV = "test";

let passed = 0;
let failed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, err });
    console.log(`  ❌ ${name}\n     ${err.message}`);
  }
}

const main = async () => {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log(`✅ Connected to ${MONGO_URI}`);

  const { default: landlordRoutes } = await import("../routes/landlordRoutes.js");
  const User = (await import("../models/User.js")).default;
  const Landlord = (await import("../models/Landlord.js")).default;
  const { generateAccessToken } = await import("../auth/jwt.utils.js");

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/landlords", landlordRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const authed = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  try {
    const [ownerA, ownerB, plainUser, adminUser] = await Promise.all([
      User.create({ name: "Owena Landlord", email: "a@secure-smoke.test", phone: "+911111111101", role: "landlord" }),
      User.create({ name: "Owen B Landlord", email: "b@secure-smoke.test", phone: "+911111111102", role: "landlord" }),
      User.create({ name: "Plain Patty", email: "p@secure-smoke.test", phone: "+911111111103", role: "user" }),
      User.create({ name: "Admin Ava", email: "adm@secure-smoke.test", phone: "+911111111104", role: "admin" }),
    ]);
    const tokenA = generateAccessToken(ownerA);
    const tokenB = generateAccessToken(ownerB);
    const tokenP = generateAccessToken(plainUser);
    const tokenAdmin = generateAccessToken(adminUser);

    const landlordA = await Landlord.create({
      userID: ownerA._id,
      name: ownerA.name,
      phone: "+911111111101",
      email: ownerA.email,
      bio: "A-BIO",
    });
    const landlordB = await Landlord.create({
      userID: ownerB._id,
      name: ownerB.name,
      phone: "+911111111102",
      email: ownerB.email,
    });

    const aId = String(landlordA._id);
    const bId = String(landlordB._id);

await check("401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 401);
    });

    await check("404 for a nonexistent landlord id (admin token)", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${base}/landlords/${fakeId}`, {
        method: "PUT",
        headers: authed(tokenAdmin),
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 404);
    });

    await check("403: landlord B cannot edit landlord A's doc", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenB),
        body: JSON.stringify({ bio: "HACKED" }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, "FORBIDDEN");
      const a = await Landlord.findById(landlordA._id);
      assert.equal(a.bio, "A-BIO", "landlord A's bio must be untouched");
    });

    await check("403: plain user (role=user) cannot edit a landlord doc", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenP),
        body: JSON.stringify({ bio: "HACKED" }),
      });
      assert.equal(res.status, 403);
    });

    await check("403: owner sending an admin-only field (totalProperties)", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({ totalProperties: 999 }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, "FORBIDDEN");
      const a = await Landlord.findById(landlordA._id);
      assert.equal(a.totalProperties, 0, "admin-only field must not be applied");
    });

    await check("403: owner cannot change identity (name/email)", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({ name: "Imposter", email: "hack@evil.test" }),
      });
      assert.equal(res.status, 403);
    });

    await check("403: owner cannot change tax/SEO fields (gstin, preferences)", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({ gstin: "HACK", preferences: { contactMethod: "email" } }),
      });
      assert.equal(res.status, 403);
    });

    await check("200: owner updates own allowed fields (bio, locations, address)", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({
          bio: "A-NEW-BIO",
          address: "12 Palm Avenue",
          locations: JSON.stringify(["Chandigarh", "Mohali"]),
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.bio, "A-NEW-BIO");
      assert.equal(body.data.address, "12 Palm Avenue");
      assert.deepEqual(body.data.locations, ["Chandigarh", "Mohali"]);
    });

    await check("200: admin updates another landlord's doc (incl. admin-only fields)", async () => {
      const res = await fetch(`${base}/landlords/${bId}`, {
        method: "PUT",
        headers: authed(tokenAdmin),
        body: JSON.stringify({
          name: "Admin Renamed Co",
          totalProperties: 42,
          preferences: { contactMethod: "email" },
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.name, "Admin Renamed Co");
      assert.equal(body.data.totalProperties, 42);
      assert.equal(body.data.preferences.contactMethod, "email");
    });
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(` - ${f.name}: ${f.err.message}`);
    process.exit(1);
  }
  process.exit(0);
};

main().catch((err) => {
  console.error("❌ Smoke test crashed:", err);
  process.exit(1);
});
    console.log("\n— PUT /api/landlords/:id —");