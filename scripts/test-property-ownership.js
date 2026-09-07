/**
 * Smoke test for Property ownership trust.
 * Usage: node scripts/test-property-ownership.js
 */
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import express from "express";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_property_ownership_smoke_test";
const DB_NAME = "pb_property_ownership_smoke_test";
process.env.JWT_ACCESS_SECRET = "smoke-test-secret";
process.env.NODE_ENV = "test";

let passed = 0;
let failed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, err });
    console.log(`  FAIL: ${name} - ${err.message}`);
  }
}

const main = async () => {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log(`Connected to ${MONGO_URI}`);

  const { default: propertyRoutes } = await import("../routes/propertyRoutes.js");
  const User = (await import("../models/User.js")).default;

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/properties", propertyRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/properties`;

  const signToken = (user) =>
    jwt.sign(
      { userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion ?? 0 },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m", issuer: "propertybulbul.com", audience: "propertybulbul.com" }
    );

  const [owner, otherUser, admin] = await User.create([
    { name: "Owner", email: "owner@smoke.test", role: "user" },
    { name: "Other", email: "other@smoke.test", role: "user" },
    { name: "Admin", email: "admin@smoke.test", role: "admin" },
  ]);

  const ownerToken = signToken(owner);
  const otherToken = signToken(otherUser);
  const adminToken = signToken(admin);

  // Helper: create a property, optionally with spoofed userEmail
  const createProperty = async (token, spoofedEmail = null) => {
    const body = new URLSearchParams();
    body.append("title", "Smoke Test Property");
    body.append("description", "Created by smoke test");
    body.append("deal", "Sale");
    body.append("type", "Residential");
    body.append("price", "5000000");
    body.append("postedBy", "Owner");
    if (spoofedEmail) body.append("userEmail", spoofedEmail);

    const res = await fetch(`${base}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: body.toString(),
    });
    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return { status: res.status, json };
  };

  // Helper: update a property
  const updateProperty = async (id, token, title) => {
    const body = new URLSearchParams();
    body.append("title", title);

    const res = await fetch(`${base}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: body.toString(),
    });
    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return { status: res.status, json };
  };

  console.log("\n--- POST /api/properties (ownership attribution) ---");
  let propertyId;

  await check("creates property attributed to authenticated user", async () => {
    const { status, json } = await createProperty(ownerToken);
    assert.equal(status, 201, `status=${status} body=${JSON.stringify(json)}`);
    propertyId = json._id || json.id;
    assert.equal(String(json.user), String(owner._id), "owner should be authenticated user");
  });

  await check("IGNORES spoofed userEmail - still attributes to authenticated user", async () => {
    const { status, json } = await createProperty(ownerToken, "other@smoke.test");
    assert.equal(status, 201, `status=${status} body=${JSON.stringify(json)}`);
    assert.equal(String(json.user), String(owner._id), "owner should be authenticated user, NOT spoofed");
    assert.notEqual(String(json.user), String(otherUser._id), "must NOT attribute to spoofed user");
  });

  console.log("\n--- PUT /api/properties/:id (ownership enforcement) ---");
  assert.ok(propertyId, "need a created property to test updates");

  await check("returns 403 FORBIDDEN when updating property you DON'T own", async () => {
    const { status, json } = await updateProperty(propertyId, otherToken, "Hacked Title");
    assert.equal(status, 403, `status=${status} body=${JSON.stringify(json)}`);
    assert.equal(json.code, "FORBIDDEN", "should have FORBIDDEN error code");
    assert.equal(json.success, false);
  });

  await check("SUCCEEDS when updating your OWN property", async () => {
    const { status, json } = await updateProperty(propertyId, ownerToken, "Legit Updated Title");
    assert.equal(status, 200, `status=${status} body=${JSON.stringify(json)}`);
    assert.equal(json.title, "Legit Updated Title");
  });

  await check("ADMIN can update ANY property", async () => {
    const { status, json } = await updateProperty(propertyId, adminToken, "Admin Updated Title");
    assert.equal(status, 200, `status=${status} body=${JSON.stringify(json)}`);
    assert.equal(json.title, "Admin Updated Title");
    assert.equal(String(json.user), String(owner._id), "admin update should NOT change ownership");
  });

  // Teardown
  await server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(` - ${f.name}: ${f.err.message}`);
    process.exit(1);
  }
  console.log("All ownership-trust checks passed!");
  process.exit(0);
};

main().catch((err) => {
  console.error("TEST FAILED:", err.message);
  process.exit(1);
});
