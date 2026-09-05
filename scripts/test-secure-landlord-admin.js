/**
 * Smoke test for the secured remaining landlord admin/legacy routes:
 *
 *   DELETE /:id                      (admin-only)
 *   POST   /:id/documents            (owner-or-admin)
 *   PATCH  /:id/documents/:docId/verify (admin-only)
 *   PATCH  /:id/verify               (admin-only)
 *   PUT    /:id/bank-details         (owner-or-admin)
 *   PATCH  /:id/featured             (admin-only)
 *   PATCH  /:id/status               (admin-only)
 *
 * For each: 401 with no auth, 403 for the wrong actor, 200 for the correct
 * actor. Also asserts the bank-details response keeps the accountNumber masked
 * to last 4 digits (XXXX…), while the DB keeps the full value.
 *
 * Throwaway local MongoDB; REAL landlord routes over HTTP with REAL JWT auth.
 * Usage: node scripts/test-secure-landlord-admin.js
 */
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_secure_landlord_admin_smoke";
const DB_NAME = "pb_secure_landlord_admin_smoke";

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
    const [admin, ownerA, ownerB, ownerC, plainUser] = await Promise.all([
      User.create({ name: "Admin Ava", email: "adm@landl-sec.test", phone: "+911111111201", role: "admin" }),
      User.create({ name: "Landlord Alia", email: "a@landl-sec.test", phone: "+911111111202", role: "landlord" }),
      User.create({ name: "Landlord Bob", email: "b@landl-sec.test", phone: "+911111111203", role: "landlord" }),
      User.create({ name: "Landlord Cara", email: "c@landl-sec.test", phone: "+911111111205", role: "landlord" }),
      User.create({ name: "Plain Pat", email: "p@landl-sec.test", phone: "+911111111204", role: "user" }),
    ]);
    const tokenAdmin = generateAccessToken(admin);
    const tokenA = generateAccessToken(ownerA);
    const tokenB = generateAccessToken(ownerB);
    const tokenC = generateAccessToken(ownerC);
    const tokenP = generateAccessToken(plainUser);

    const L_a = await Landlord.create({
      userID: ownerA._id,
      name: ownerA.name,
      phone: "+911111111202",
      email: ownerA.email,
      bio: "A-BIO",
    });
    const L_b = await Landlord.create({
      userID: ownerB._id,
      name: ownerB.name,
      phone: "+911111111203",
      email: ownerB.email,
    });
    const L_doc = await Landlord.create({
      userID: ownerC._id,
      name: ownerC.name,
      email: ownerC.email,
      documents: [
        { title: "ID", type: "id_proof", url: "/uploads/x.pdf", verified: false },
      ],
    });

    const aId = String(L_a._id);
    const bId = String(L_b._id);
    const docId = String(L_doc.documents[0]._id);
    const lDocId = String(L_doc._id);

await check("delete: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${bId}`, { method: "DELETE" });
      assert.equal(res.status, 401);
    });

    await check("delete: 403 owner cannot delete own profile", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "DELETE",
        headers: authed(tokenA),
      });
      assert.equal(res.status, 403);
      assert.ok(await Landlord.findById(aId), "doc must still exist");
    });

    await check("delete: 403 another landlord cannot delete", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "DELETE",
        headers: authed(tokenB),
      });
      assert.equal(res.status, 403);
    });

    await check("delete: 403 plain user (role=user) cannot delete", async () => {
      const res = await fetch(`${base}/landlords/${aId}`, {
        method: "DELETE",
        headers: authed(tokenP),
      });
      assert.equal(res.status, 403);
    });

    await check("delete: 200 admin deletes a landlord + demotes user", async () => {
      const res = await fetch(`${base}/landlords/${bId}`, {
        method: "DELETE",
        headers: authed(tokenAdmin),
      });
      assert.equal(res.status, 200);
      assert.equal(await Landlord.findById(bId), null, "doc should be gone");
      const bob = await User.findById(ownerB._id);
      assert.equal(bob.role, "user", "linked user should be demoted");
    });

    console.log("\n— POST /api/landlords/:id/documents (owner-or-admin) —");

    await check("upload: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "X", type: "id_proof" }),
      });
      assert.equal(res.status, 401);
    });

    await check("upload: 403 non-owner landlord cannot upload to A's doc", async () => {
      const res = await fetch(`${base}/landlords/${aId}/documents`, {
        method: "POST",
        headers: authed(tokenB),
        body: JSON.stringify({ title: "X", type: "id_proof" }),
      });
      assert.equal(res.status, 403);
    });

    // NOTE: the `upload.single("document")` middleware routes file IO through
// Cloudinary (see middlewares/multer.js), which isn't available in throwaway
// smoke tests — the image/video-only fileFilter would reject any Blob we send.
// The security-relevant paths (401 / 403 before any file IO) are covered above
// and below; the owner 200 branch of the controller is exercised in
// test-profile-me.js via the /me endpoints which share the same permission
// logic (and the earlier "upload: 403 non-owner" proves ownership gates first).

    console.log("\n— PATCH /api/landlords/:id/documents/:docId/verify (admin-only) —");

    await check("verifyDoc: 401 with no auth", async () => {
      const res = await fetch(
        `${base}/landlords/${lDocId}/documents/${docId}/verify`,
        { method: "PATCH" },
      );
      assert.equal(res.status, 401);
    });

    await check("verifyDoc: 403 owner cannot verify own document", async () => {
      const res = await fetch(
        `${base}/landlords/${lDocId}/documents/${docId}/verify`,
        { method: "PATCH", headers: authed(tokenC) },
      );
      assert.equal(res.status, 403);
      const l = await Landlord.findById(L_doc._id);
      assert.equal(l.documents.id(docId).verified, false);
    });

    await check("verifyDoc: 200 admin verifies the document", async () => {
      const res = await fetch(
        `${base}/landlords/${lDocId}/documents/${docId}/verify`,
        { method: "PATCH", headers: authed(tokenAdmin) },
      );
      assert.equal(res.status, 200);
      const l = await Landlord.findById(L_doc._id);
      assert.equal(l.documents.id(docId).verified, true);
    });
console.log("\n— PATCH /api/landlords/:id/verify (admin-only) —");

    await check("verify: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });
      assert.equal(res.status, 401);
    });

    await check("verify: 403 owner cannot self-verify", async () => {
      const res = await fetch(`${base}/landlords/${aId}/verify`, {
        method: "PATCH",
        headers: authed(tokenA),
        body: JSON.stringify({ isVerified: true }),
      });
      assert.equal(res.status, 403);
      const l = await Landlord.findById(L_a._id);
      assert.equal(l.isVerified, false);
    });

    await check("verify: 200 admin verifies a landlord", async () => {
      const res = await fetch(`${base}/landlords/${aId}/verify`, {
        method: "PATCH",
        headers: authed(tokenAdmin),
        body: JSON.stringify({ isVerified: true, identityVerified: true }),
      });
      assert.equal(res.status, 200);
      const l = await Landlord.findById(L_a._id);
      assert.equal(l.isVerified, true);
      assert.equal(l.identityVerified, true);
    });

    console.log("\n— PUT /api/landlords/:id/bank-details (owner-or-admin) —");

    await check("bank: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}/bank-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber: "111" }),
      });
      assert.equal(res.status, 401);
    });

    await check("bank: 403 non-owner landlord cannot set A's bank details", async () => {
      const res = await fetch(`${base}/landlords/${aId}/bank-details`, {
        method: "PUT",
        headers: authed(tokenB),
        body: JSON.stringify({ accountNumber: "999" }),
      });
      assert.equal(res.status, 403);
    });

    await check("bank: 200 owner sets bank details — response masks accountNumber", async () => {
      const res = await fetch(`${base}/landlords/${aId}/bank-details`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({
          accountHolderName: "Alia Landlord",
          accountNumber: "123456789012",
          ifscCode: "HDFC000123",
          bankName: "HDFC",
          upiId: "alia@upi",
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      // Model toJSON masks bank accountNumber to XXXX + last 4
      assert.equal(body.data.bankDetails.accountNumber, "XXXX9012");
      // DB keeps the full value
      const l = await Landlord.findById(L_a._id);
      assert.equal(l.bankDetails.accountNumber, "123456789012");
    });

    await check("bank: 200 admin sets bank details on another landlord", async () => {
      const res = await fetch(`${base}/landlords/${aId}/bank-details`, {
        method: "PUT",
        headers: authed(tokenAdmin),
        body: JSON.stringify({ upiId: "admin-set@upi", ifscCode: "ICIC0009" }),
      });
      assert.equal(res.status, 200);
    });
console.log("\n— PATCH /api/landlords/:id/featured (admin-only) —");

    await check("featured: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}/featured`, {
        method: "PATCH",
      });
      assert.equal(res.status, 401);
    });

    await check("featured: 403 owner cannot feature self", async () => {
      const res = await fetch(`${base}/landlords/${aId}/featured`, {
        method: "PATCH",
        headers: authed(tokenA),
      });
      assert.equal(res.status, 403);
    });

    await check("featured: 200 admin toggles featured", async () => {
      const res = await fetch(`${base}/landlords/${aId}/featured`, {
        method: "PATCH",
        headers: authed(tokenAdmin),
      });
      assert.equal(res.status, 200);
      const l = await Landlord.findById(L_a._id);
      assert.equal(l.featured, true);
    });

    console.log("\n— PATCH /api/landlords/:id/status (admin-only) —");

    await check("status: 401 with no auth", async () => {
      const res = await fetch(`${base}/landlords/${aId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended" }),
      });
      assert.equal(res.status, 401);
    });

    await check("status: 403 owner cannot change own status", async () => {
      const res = await fetch(`${base}/landlords/${aId}/status`, {
        method: "PATCH",
        headers: authed(tokenA),
        body: JSON.stringify({ status: "suspended" }),
      });
      assert.equal(res.status, 403);
    });

    await check("status: 200 admin updates status", async () => {
      const res = await fetch(`${base}/landlords/${aId}/status`, {
        method: "PATCH",
        headers: authed(tokenAdmin),
        body: JSON.stringify({ status: "suspended" }),
      });
      assert.equal(res.status, 200);
      const l = await Landlord.findById(L_a._id);
      assert.equal(l.status, "suspended");
    });

    await check("status: 400 invalid status value (admin)", async () => {
      const res = await fetch(`${base}/landlords/${aId}/status`, {
        method: "PATCH",
        headers: authed(tokenAdmin),
        body: JSON.stringify({ status: "banana" }),
      });
      assert.equal(res.status, 400);
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
    console.log("\n— DELETE /api/landlords/:id (admin-only) —");