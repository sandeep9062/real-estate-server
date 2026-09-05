/**
 * Smoke test for the authenticated own-profile update endpoints:
 *
 *   PUT /api/agents/me      (new — partial update, scoped to requester)
 *   PUT /api/landlords/me   (new — partial update, scoped to requester)
 *
 * - Throwaway local MongoDB; REAL routes over HTTP with REAL JWT auth.
 * - Users created directly via the model; tokens signed with
 *   generateAccessToken (as production does).
 * - Drops the db when done.
 *
 * Usage:  node scripts/test-profile-me.js
 */
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_profile_me_smoke_test";
const DB_NAME = "pb_profile_me_smoke_test";

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

  const { default: agentRoutes } = await import("../routes/agentRoutes.js");
  const { default: landlordRoutes } = await import("../routes/landlordRoutes.js");
  const User = (await import("../models/User.js")).default;
  const Agent = (await import("../models/Agent.js")).default;
  const Landlord = (await import("../models/Landlord.js")).default;
  const { generateAccessToken } = await import("../auth/jwt.utils.js");

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/agents", agentRoutes);
  app.use("/api/landlords", landlordRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const authed = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const makeUser = async (email, name, role = "user") =>
    User.create({ name, email, phone: "+919999999901", role });

  try {
    const [agentA, agentB, landlord, plainUser, ghostAgent] = await Promise.all([
      makeUser("a@me-smoke.test", "Alia Meagent", "agent"),
      makeUser("b@me-smoke.test", "Bob Otheragent", "agent"),
      makeUser("l@me-smoke.test", "Liam Melandlord", "landlord"),
      makeUser("p@me-smoke.test", "Pat Plainuser", "user"),
      makeUser("g@me-smoke.test", "Gia Ghostagent", "agent"),
    ]);
    const tokenA = generateAccessToken(agentA);
    const tokenB = generateAccessToken(agentB);
    const tokenL = generateAccessToken(landlord);
    const tokenP = generateAccessToken(plainUser);
    const tokenG = generateAccessToken(ghostAgent);

    // Seed profiles for A, B and the landlord (ghostAgent stays doc-less)
    await Agent.create({ userID: agentA._id, name: agentA.name, email: agentA.email });
    await Agent.create({
      userID: agentB._id,
      name: agentB.name,
      email: agentB.email,
      bio: "BOB-UNTOUCHED",
    });
    await Landlord.create({
      userID: landlord._id,
      name: landlord.name,
      email: landlord.email,
    });

    console.log("\n— PUT /api/agents/me —");

    await check("partial update: only bio changes, completeness recomputed", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({ bio: "I help families find homes" }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.bio, "I help families find homes");
      assert.ok(!body.data.rera, "rera should be untouched/empty");
      assert.equal(body.data.profileCompleteness, 20); // 1 of 5 fields
    });

    await check("array field accepted as JSON string; merged fields persist", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({
          locations: JSON.stringify(["Chandigarh", "Mohali"]),
          specialisations: ["Residential Sale"],
          rera: "RERA-PB-001",
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.deepEqual(body.data.locations, ["Chandigarh", "Mohali"]);
      assert.deepEqual(body.data.specialisations, ["Residential Sale"]);
      assert.equal(body.data.rera, "RERA-PB-001");
      assert.equal(body.data.bio, "I help families find homes"); // from earlier update
      assert.equal(body.data.profileCompleteness, 80); // bio+rera+locations+specialisations
    });

    await check("forbidden/unknown fields are ignored (no email/verified change)", async () => {
      // Payload mixes one editable field with forbidden ones — only the
      // editable one may be applied, and forbidden ones must never land.
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({
          whatsapp: "+919000000001",
          email: "hacker@evil.test",
          verified: "true",
          userID: agentB._id,
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.email, agentA.email);
      assert.equal(body.data.whatsapp, "+919000000001");
      const agent = await Agent.findOne({ userID: agentA._id });
      assert.equal(agent.verified, false);
      assert.equal(String(agent.userID), String(agentA._id));
    });

    await check("invalid array payload rejected (400)", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({ locations: { not: "an array" } }),
      });
      assert.equal(res.status, 400);
    });

    await check("empty body rejected (400, no editable fields)", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenA),
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
    });

await check("ownership scoping: updating A does not touch B's doc", async () => {
      const bob = await Agent.findOne({ userID: agentB._id });
      assert.equal(bob.bio, "BOB-UNTOUCHED");
      const bobCount = await Agent.countDocuments({ userID: agentB._id });
      assert.equal(bobCount, 1);
    });

    await check("lazy fallback: role=agent, doc missing → created then updated (200)", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenG),
        body: JSON.stringify({ bio: "Ghost agent bio" }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.bio, "Ghost agent bio");
      assert.equal(String(body.data.userID), String(ghostAgent._id));
      assert.equal(await Agent.countDocuments({ userID: ghostAgent._id }), 1);
    });

    await check("401 without auth", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 401);
    });

    await check("404 for role=user (not an agent)", async () => {
      const res = await fetch(`${base}/agents/me`, {
        method: "PUT",
        headers: authed(tokenP),
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 404);
    });

    console.log("\n— PUT /api/landlords/me —");

    await check("partial update: address + propertyTypes, completeness recomputed", async () => {
      const res = await fetch(`${base}/landlords/me`, {
        method: "PUT",
        headers: authed(tokenL),
        body: JSON.stringify({
          address: "42 Palm Avenue",
          propertyTypes: JSON.stringify(["Residential"]),
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.address, "42 Palm Avenue");
      assert.deepEqual(body.data.propertyTypes, ["Residential"]);
      assert.equal(body.data.profileCompleteness, 40); // address + propertyTypes of 5
    });

    await check("bankDetails not editable via /me (forbidden field ignored)", async () => {
      const res = await fetch(`${base}/landlords/me`, {
        method: "PUT",
        headers: authed(tokenL),
        body: JSON.stringify({ bankDetails: { accountNumber: "HACKED" } }),
      });
      assert.equal(res.status, 400); // no editable fields → rejected
      const doc = await Landlord.findOne({ userID: landlord._id });
      assert.equal(doc.bankDetails?.accountNumber, undefined);
    });

    await check("401 without auth", async () => {
      const res = await fetch(`${base}/landlords/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 401);
    });

    await check("404 for role=user (not a landlord)", async () => {
      const res = await fetch(`${base}/landlords/me`, {
        method: "PUT",
        headers: authed(tokenP),
        body: JSON.stringify({ bio: "nope" }),
      });
      assert.equal(res.status, 404);
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

