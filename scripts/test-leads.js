/**
 * Smoke test for the Lead Organizer backend (/api/leads).
 *
 * - Connects to a THROWAWAY local MongoDB database (never the Atlas cluster).
 * - Boots a minimal express app with the REAL leadRoutes (real JWT auth, real
 *   rate limiter) so the endpoints are tested end-to-end over HTTP.
 * - Cleans up (drops the db) when done.
 *
 * Usage:  node scripts/test-leads.js
 */
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import express from "express";

const MONGO_URI = "mongodb://127.0.0.1:27017/pb_leads_smoke_test";
const DB_NAME = "pb_leads_smoke_test";

// Secret used both to sign test tokens and (via env) by jwt.utils.getJwtAccessSecret.
process.env.JWT_ACCESS_SECRET = "smoke-test-secret";
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

  const { default: leadRoutes } = await import("../routes/leadRoutes.js");
  const User = (await import("../models/User.js")).default;
  const Property = (await import("../models/Property.js")).default;
  const Lead = (await import("../models/Lead.js")).default;

  // 2. Minimal express app — real lead routes, json body parsing only.
  const app = express();
  app.use(express.json());
  app.use("/api/leads", leadRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/leads`;

  const signToken = (user) =>
    jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m", issuer: "propertybulbul.com", audience: "propertybulbul.com" },
    );

  // 3. Fixtures
  const [agent1, agent2, buyer] = await User.create([
    { name: "Agent One", email: "agent1@smoke.test", role: "agent", phone: "9876500011" },
    { name: "Agent Two", email: "agent2@smoke.test", role: "agent" },
    { name: "Buyer Bob", email: "buyer@smoke.test", role: "user", phone: "9876500022" },
  ]);

  const [property1, property2] = await Property.create([
    {
      title: "3BHK Flat Sector 62",
      description: "Smoke-test listing for agent1",
      address: "Sector 62, Noida",
      deal: "Sale",
      type: "Residential",
      price: 9500000,
      user: agent1._id,
      isActive: true,
    },
    {
      title: "2BHK Rent Sector 50",
      description: "Smoke-test listing for agent2",
      address: "Sector 50, Noida",
      deal: "Rent",
      type: "Residential",
      price: 25000,
      user: agent2._id,
      isActive: true,
    },
  ]);

  const agent1Token = signToken(agent1);
  const agent2Token = signToken(agent2);
  const buyerToken = signToken(buyer);

  const call = async (method, path, { body, token } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* no body */
    }
    return { status: res.status, json };
  };

  let leadId; // created in test 1, reused below

  console.log("\n— POST /api/leads (lead creation from WhatsApp click) —");
  await check(
    "creates a lead for anonymous buyer, agentId derived from property owner",
    async () => {
      const { status, json } = await call("POST", "/", {
        body: { propertyId: property1._id.toString() },
      });
      assert.equal(status, 201, `status=${status} body=${JSON.stringify(json)}`);
      assert.equal(json.success, true);
      const lead = json.data;
      assert.equal(String(lead.agentId), String(agent1._id));
      assert.equal(String(lead.propertyId), String(property1._id));
      assert.equal(lead.status, "New");
      assert.equal(lead.source, "whatsapp_click");
      assert.equal(lead.type, "WHATSAPP_CLICK");
      assert.ok(lead.lastActivityAt, "lastActivityAt should be set on creation");
      assert.ok(lead.id, "toJSON virtual id should be present");
      leadId = lead.id;
    },
  );

  await check(
    "falls back to authenticated buyer's name/phone when body omits them",
    async () => {
      const { status, json } = await call("POST", "/", {
        token: buyerToken,
        body: { propertyId: property1._id.toString() },
      });
      assert.equal(status, 201);
      assert.equal(json.data.buyerName, "Buyer Bob");
      assert.equal(json.data.buyerPhone, "9876500022");
    },
  );

  await check("accepts explicit buyerName/buyerPhone from request body", async () => {
    const { status, json } = await call("POST", "/", {
      body: {
        propertyId: property1._id.toString(),
        buyerName: "Rahul V",
        buyerPhone: "+91 98111 22334",
      },
    });
    assert.equal(status, 201);
    assert.equal(json.data.buyerName, "Rahul V");
    assert.equal(json.data.buyerPhone, "+91 98111 22334");
  });

  await check("rejects missing/invalid propertyId with 400", async () => {
    const a = await call("POST", "/", { body: {} });
    assert.equal(a.status, 400);
    const b = await call("POST", "/", { body: { propertyId: "not-an-id" } });
    assert.equal(b.status, 400);
  });

  await check("returns 404 for a nonexistent property", async () => {
    const { status } = await call("POST", "/", {
      body: { propertyId: new mongoose.Types.ObjectId().toString() },
    });
    assert.equal(status, 404);
  });

  console.log("\n— GET /api/leads (agent's own leads) —");
  await check("requires auth (401 without token)", async () => {
    const { status } = await call("GET", "/");
    assert.equal(status, 401);
  });

  await check("forbids non-agent roles (buyer gets 403)", async () => {
    const { status } = await call("GET", "/", { token: buyerToken });
    assert.equal(status, 403);
  });

  await check("returns only the authenticated agent's leads with populated property", async () => {
    const { status, json } = await call("GET", "/", { token: agent1Token });
    assert.equal(status, 200);
    assert.ok(json.count >= 3);
    assert.ok(json.data.every((l) => String(l.agentId) === String(agent1._id)));
    assert.ok(json.data[0].property, "property should be populated");
    assert.equal(json.data[0].property.title, "3BHK Flat Sector 62");
    // default sort: lastActivityAt desc
    const times = json.data.map((l) => new Date(l.lastActivityAt).getTime());
    assert.deepEqual(times, [...times].sort((a, b) => b - a));
  });

  await check("filters by status", async () => {
    const { status, json } = await call("GET", "/?status=New", { token: agent1Token });
    assert.equal(status, 200);
    assert.ok(json.data.every((l) => l.status === "New"));
  });

  await check("rejects invalid status filter with 400", async () => {
    const { status } = await call("GET", "/?status=Bogus", { token: agent1Token });
    assert.equal(status, 400);
  });

  await check("supports sortBy/sortOrder", async () => {
    const { status, json } = await call("GET", "/?sortBy=createdAt&sortOrder=asc", {
      token: agent1Token,
    });
    assert.equal(status, 200);
    const times = json.data.map((l) => new Date(l.createdAt).getTime());
    assert.deepEqual(times, [...times].sort((a, b) => a - b));
  });

  console.log("\n— PATCH /api/leads/:id (status + notes) —");
  await check("owner can update status and notes; lastActivityAt is bumped", async () => {
    const before = await Lead.findById(leadId);
    const beforeTs = new Date(before.lastActivityAt).getTime();
    await new Promise((r) => setTimeout(r, 20)); // ensure a measurable time gap

    const { status, json } = await call("PATCH", `/${leadId}`, {
      token: agent1Token,
      body: { status: "Contacted", notes: "Called buyer, interested in site visit" },
    });
    assert.equal(status, 200);
    assert.equal(json.data.status, "Contacted");
    assert.equal(json.data.notes, "Called buyer, interested in site visit");
    const afterTs = new Date(json.data.lastActivityAt).getTime();
    assert.ok(afterTs > beforeTs, "lastActivityAt should increase on activity");
  });

  await check("PATCH with no actual change leaves lastActivityAt untouched", async () => {
    const before = (await call("GET", "/?sortBy=createdAt&sortOrder=asc", { token: agent1Token }))
      .json.data.find((l) => l.id === leadId);
    const { status, json } = await call("PATCH", `/${leadId}`, {
      token: agent1Token,
      body: { status: "Contacted" }, // same as current
    });
    assert.equal(status, 200);
    assert.equal(
      new Date(json.data.lastActivityAt).getTime(),
      new Date(before.lastActivityAt).getTime(),
    );
  });

  await check("non-owner agent gets 403", async () => {
    const { status, json } = await call("PATCH", `/${leadId}`, {
      token: agent2Token,
      body: { status: "Closed" },
    });
    assert.equal(status, 403);
    assert.equal(json.code, "FORBIDDEN");
    // and the lead really is unchanged
    const doc = await Lead.findById(leadId);
    assert.equal(doc.status, "Contacted");
  });

  await check("invalid status value gets 400", async () => {
    const { status } = await call("PATCH", `/${leadId}`, {
      token: agent1Token,
      body: { status: "WON" },
    });
    assert.equal(status, 400);
  });

  await check("nonexistent lead id gets 404", async () => {
    const { status } = await call("PATCH", `/${new mongoose.Types.ObjectId()}`, {
      token: agent1Token,
      body: { status: "Closed" },
    });
    assert.equal(status, 404);
  });

  await check("PATCH requires auth (401)", async () => {
    const { status } = await call("PATCH", `/${leadId}`, { body: { status: "Closed" } });
    assert.equal(status, 401);
  });

  console.log("\n— GET /api/leads/stats —");
  await check("returns totals, this-week count, byStatus and conversionRate", async () => {
    const { status, json } = await call("GET", "/stats", { token: agent1Token });
    assert.equal(status, 200);
    const { total, totalThisWeek, byStatus, conversionRate, closed } = json.data;
    assert.ok(total >= 3);
    assert.ok(totalThisWeek >= 3, "all fixture leads were created this week");
    assert.equal(byStatus["Contacted"], 1);
    assert.equal(closed, 0);
    assert.equal(conversionRate, 0);
  });

  await check("stats respects auth/roles (401 anon, 403 buyer)", async () => {
    assert.equal((await call("GET", "/stats")).status, 401);
    assert.equal((await call("GET", "/stats", { token: buyerToken })).status, 403);
  });

  console.log("\n— Stale-lead support data —");
  await check("lastActivityAt can age (flagging is a frontend concern)", async () => {
    const lead = await Lead.findById(leadId);
    lead.lastActivityAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    await lead.save();
    const stale = await Lead.findById(leadId).lean();
    assert.ok(Date.now() - new Date(stale.lastActivityAt).getTime() > 4 * 24 * 60 * 60 * 1000);
  });

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failures.length) {
    console.log("\nFailed checks:");
    for (const f of failures) console.log(` - ${f.name}: ${f.err.message}`);
  }

  // 4. Cleanup
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
};

main().catch(async (err) => {
  console.error("💥 Smoke test crashed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
