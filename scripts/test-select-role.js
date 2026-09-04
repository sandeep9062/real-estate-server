/**
 * Smoke test for the role-selection & profile endpoints:
 *
 *   POST /api/auth/select-role   (new — role selection for fresh users)
 *   GET  /api/agents/me          (new — own profile + profileCompleteness)
 *   GET  /api/landlords/me       (new — own profile + profileCompleteness)
 *
 * - Connects to a THROWAWAY local MongoDB database (never the Atlas cluster).
 * - Boots a minimal express app with the REAL auth routes, agent routes and
 *   landlord routes (real JWT auth middleware) so the endpoints are tested
 *   end-to-end over HTTP.
 * - Users are created directly via the model (avoids the register rate
 *   limiter and welcome-email side effects); tokens are signed with
 *   generateAccessToken, exactly as production does.
 * - The old public /api/agents/register and /api/landlords/register wizards
 *   are exercised over HTTP to simulate pre-existing profile docs.
 * - Cleans up (drops the db) when done.
 *
 * Usage:  node scripts/test-select-role.js
 */
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_role_smoke_test";
const DB_NAME = "pb_role_smoke_test";

// Secrets needed by module-level constructors (jwt.utils, utils/send-email).
process.env.JWT_ACCESS_SECRET = "smoke-test-secret";
process.env.RESEND_API_KEY = "smoke-test-key"; // never used — no emails sent
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
  // 1. Connect to the throwaway DB BEFORE importing anything that touches models.
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log(`✅ Connected to ${MONGO_URI}`);

  const { default: authRoutes } = await import("../auth/auth.routes.js");
  const { default: agentRoutes } = await import("../routes/agentRoutes.js");
  const { default: landlordRoutes } = await import("../routes/landlordRoutes.js");
  const User = (await import("../models/User.js")).default;
  const Agent = (await import("../models/Agent.js")).default;
  const Landlord = (await import("../models/Landlord.js")).default;
  const { generateAccessToken } = await import("../auth/jwt.utils.js");

  // 2. Minimal express app — real routes, json body parsing + cookies.
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/agents", agentRoutes);
  app.use("/api/landlords", landlordRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const authed = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const makeUser = async (email, name) =>
    User.create({
      name: name || "Test User",
      email,
      phone: "+919999999901",
      role: "user",
    });

  try {
    // Create test users up-front (role "user", no profile docs).
    const [userA, userB, userC, userD, userE, userF] = await Promise.all([
      makeUser("a@role-smoke.test", "Alice Agenttest"),
      makeUser("b@role-smoke.test", "Bob Badrole"),
      makeUser("c@role-smoke.test", "Carol Oldwizard"),
      makeUser("d@role-smoke.test", "Dan Oldlandlord"),
      makeUser("e@role-smoke.test", "Eve Norole"),
      makeUser("f@role-smoke.test", "Fay Lazyagent"),
    ]);
    const tokenA = generateAccessToken(userA);
    const tokenB = generateAccessToken(userB);
    const tokenC = generateAccessToken(userC);
    const tokenD = generateAccessToken(userD);
    const tokenE = generateAccessToken(userE);
    const tokenF = generateAccessToken(userF); // role flipped to agent later

    console.log("\n— POST /api/auth/select-role —");

    await check("agent selection succeeds (200, role updated, token re-issued)", async () => {
      const res = await fetch(`${base}/auth/select-role`, {
        method: "POST",
        headers: authed(tokenA),
        body: JSON.stringify({ role: "agent" }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.user.role, "agent");
      assert.ok(body.token, "expected a fresh token in the response");
      // Fresh token must reflect the new role
      const { verifyAccessToken } = await import("../auth/jwt.utils.js");
      const decoded = verifyAccessToken(body.token);
      assert.equal(decoded.role, "agent");
      assert.equal(decoded.userId, String(userA._id));
      // Profile doc created from User data, everything else at defaults
      const agent = await Agent.findOne({ userID: userA._id });
      assert.ok(agent, "Agent doc should exist");
      assert.equal(agent.name, userA.name);
      assert.equal(agent.phone, userA.phone);
      assert.equal(agent.email, userA.email);
      assert.equal(agent.verified, false);
      assert.ok(!agent.bio, "bio should be empty (no default)");
      assert.deepEqual(agent.locations, []);
    });

    await check("second role selection is rejected (409)", async () => {
      const res = await fetch(`${base}/auth/select-role`, {
        method: "POST",
        headers: authed(tokenA),
        body: JSON.stringify({ role: "landlord" }),
      });
      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      // Role must NOT have changed
      const user = await User.findById(userA._id);
      assert.equal(user.role, "agent");
    });

    await check("invalid role value is rejected (400)", async () => {
      const res = await fetch(`${base}/auth/select-role`, {
        method: "POST",
        headers: authed(tokenB),
        body: JSON.stringify({ role: "builder" }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      const user = await User.findById(userB._id);
      assert.equal(user.role, "user", "role must stay 'user' after a 400");
      assert.equal(await Agent.countDocuments({ userID: userB._id }), 0);
      assert.equal(await Landlord.countDocuments({ userID: userB._id }), 0);
    });

    await check(
      "idempotent: user with an existing Agent doc (old wizard) re-selects agent without duplicates",
      async () => {
        // Simulate the old public wizard over HTTP
        const wiz = await fetch(`${base}/agents/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(userC._id),
            name: userC.name,
            phone: "+918888888803",
            locations: ["Chandigarh"],
            specialisations: ["Residential"],
            bio: "WIZARD-BIO-KEEP",
          }),
        });
        assert.equal(wiz.status, 201, `wizard register failed: ${await wiz.text()}`);

        // Now select-role — must reuse the existing doc, not create a duplicate
        const res = await fetch(`${base}/auth/select-role`, {
          method: "POST",
          headers: authed(tokenC),
          body: JSON.stringify({ role: "agent" }),
        });
        assert.equal(res.status, 200, `select-role failed: ${await res.text()}`);
        assert.equal(await Agent.countDocuments({ userID: userC._id }), 1);
        const agent = await Agent.findOne({ userID: userC._id });
        assert.equal(agent.bio, "WIZARD-BIO-KEEP", "existing doc fields must not be overwritten");
        assert.equal(agent.phone, "+918888888803");
      },
    );

    await check(
      "idempotent: user with an existing Landlord doc (old wizard) re-selects landlord without duplicates",
      async () => {
        const wiz = await fetch(`${base}/landlords/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(userD._id),
            name: userD.name,
            phone: "+917777777704",
            bio: "WIZARD-LANDLORD-KEEP",
            address: "12 Keep Street",
          }),
        });
        assert.equal(wiz.status, 201, `wizard register failed: ${await wiz.text()}`);

        const res = await fetch(`${base}/auth/select-role`, {
          method: "POST",
          headers: authed(tokenD),
          body: JSON.stringify({ role: "landlord" }),
        });
        assert.equal(res.status, 200, `select-role failed: ${await res.text()}`);
        assert.equal(await Landlord.countDocuments({ userID: userD._id }), 1);
        const landlord = await Landlord.findOne({ userID: userD._id });
        assert.equal(landlord.bio, "WIZARD-LANDLORD-KEEP");
        assert.equal(landlord.address, "12 Keep Street");
      },
    );

    console.log("\n— GET /api/agents/me —");

    await check("profileCompleteness math on a partially-filled agent profile (2/5 = 40)", async () => {
      await Agent.updateOne(
        { userID: userA._id },
        { bio: "I sell homes", rera: "RERA-PB-2026-001" },
      );
      const res = await fetch(`${base}/agents/me`, {
        headers: authed(tokenA),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.profileCompleteness, 40); // bio + rera of 5 fields
      assert.equal(body.data.email, userA.email);
    });

    await check("404 when the user is not an agent (role=user)", async () => {
      const res = await fetch(`${base}/agents/me`, {
        headers: authed(tokenE),
      });
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    await check("lazy fallback: role=agent but doc missing → doc re-created (completeness 0)", async () => {
      await User.updateOne({ _id: userF._id }, { role: "agent" });
      const res = await fetch(`${base}/agents/me`, {
        headers: authed(tokenF),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.profileCompleteness, 0); // nothing filled yet
      assert.equal(await Agent.countDocuments({ userID: userF._id }), 1);
    });

    console.log("\n— GET /api/landlords/me —");

    await check("profileCompleteness math on a partially-filled landlord profile (2/5 = 40)", async () => {
      await Landlord.updateOne(
        { userID: userD._id },
        { bio: "Renting out flats", address: "12 Keep Street" },
      );
      const res = await fetch(`${base}/landlords/me`, {
        headers: authed(tokenD),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.profileCompleteness, 40); // bio + address of 5 fields
      // Route ordering: "me" must not be swallowed by /:identifier
      assert.equal(body.data.email, userD.email);
    });

    await check("404 when the user is not a landlord (role=user)", async () => {
      const res = await fetch(`${base}/landlords/me`, {
        headers: authed(tokenE),
      });
      assert.equal(res.status, 404);
    });

    console.log("\n— auth enforcement (401) —");

    await check("select-role without auth → 401", async () => {
      const res = await fetch(`${base}/auth/select-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "agent" }),
      });
      assert.equal(res.status, 401);
    });

    await check("GET /agents/me without auth → 401", async () => {
      const res = await fetch(`${base}/agents/me`);
      assert.equal(res.status, 401);
    });

    await check("GET /landlords/me without auth → 401", async () => {
      const res = await fetch(`${base}/landlords/me`);
      assert.equal(res.status, 401);
    });
  } finally {
    // 4. Cleanup: drop the throwaway DB and stop the server.
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

