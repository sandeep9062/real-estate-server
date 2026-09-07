/**
 * Admin create-profile controllers smoke test.
 *
 * Verifies against the real DB that:
 *  1. createAgentByUserId creates a profile for an agent-role user
 *  2. duplicate creation is rejected (409)
 *  3. creation is rejected for a non-agent user (400)
 *  4. createLandlordByUserId creates a profile for a landlord-role user
 *
 * Usage: node scripts/test-admin-create.js
 */
import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import Agent from "../models/Agent.js";
import Landlord from "../models/Landlord.js";
import connectDB from "../config/db.js";
import { createAgentByUserId } from "../controllers/agentController.js";
import { createLandlordByUserId } from "../controllers/landlordController.js";

const stubRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return res;
};

const run = async () => {
  await connectDB();
  console.log("✅ Connected to DB");

  const created = { users: [], agents: [], landlords: [] };

  try {
    /* ── 1. Agent create ─────────────────────────────────────────────── */
    let agentUser = await User.findOne({ role: "agent" });
    if (!agentUser) {
      agentUser = await User.create({
        name: "Test Agent User",
        email: `test-agent-${Date.now()}@example.com`,
        phone: "9999999999",
        role: "agent",
      });
      created.users.push(agentUser._id);
    }
    // Ensure no profile exists yet
    await Agent.deleteOne({ userID: agentUser._id });

    let req = { params: { userId: agentUser._id.toString() }, body: {} };
    let res = stubRes();
    await createAgentByUserId(req, res);
    console.log(`[1] create agent (no fields) → ${res.statusCode}`, JSON.stringify(res.body?.message));
    if (res.statusCode !== 201) throw new Error("expected 201");
    const agentDoc = await Agent.findOne({ userID: agentUser._id });
    console.log(
      `    profile: name=${agentDoc.name} email=${agentDoc.email} phone=${agentDoc.phone} slug=${agentDoc.slug} status=${agentDoc.status}`,
    );
    created.agents.push(agentDoc._id);

    // Pre-populated fields should land too
    await Agent.deleteOne({ userID: agentUser._id });
    req = {
      params: { userId: agentUser._id.toString() },
      body: {
        title: "Senior Advisor",
        agencyName: "Test Realty",
        locations: ["Chandigarh", "Mohali"],
        verified: true,
        experience: 5,
        status: "active",
      },
    };
    res = stubRes();
    await createAgentByUserId(req, res);
    console.log(`[1b] create agent (with fields) → ${res.statusCode}`, res.body?.data?.locations);
    if (res.statusCode !== 201 || res.body?.data?.locations?.length !== 2)
      throw new Error("expected 201 with 2 locations");
    created.agents.push((await Agent.findOne({ userID: agentUser._id }))._id);

    /* ── 2. Duplicate agent creation ─────────────────────────────────── */
    req = { params: { userId: agentUser._id.toString() }, body: {} };
    res = stubRes();
    await createAgentByUserId(req, res);
    console.log(`[2] duplicate agent create → ${res.statusCode}`, res.body?.message);
    if (res.statusCode !== 409) throw new Error("expected 409");

    /* ── 3. Role-mismatch rejection ──────────────────────────────────── */
    let plainUser = await User.findOne({ role: "user" });
    if (!plainUser) {
      plainUser = await User.create({
        name: "Plain User",
        email: `test-plain-${Date.now()}@example.com`,
        role: "user",
      });
      created.users.push(plainUser._id);
    }
    req = { params: { userId: plainUser._id.toString() }, body: {} };
    res = stubRes();
    await createAgentByUserId(req, res);
    console.log(`[3] create agent for role=user → ${res.statusCode}`, res.body?.message);
    if (res.statusCode !== 400) throw new Error("expected 400");

    /* ── 4. Landlord create ──────────────────────────────────────────── */
    let landlordUser = await User.findOne({ role: "landlord" });
    if (!landlordUser) {
      landlordUser = await User.create({
        name: "Test Landlord User",
        email: `test-landlord-${Date.now()}@example.com`,
        phone: "9888888888",
        role: "landlord",
      });
      created.users.push(landlordUser._id);
    }
    await Landlord.deleteOne({ userID: landlordUser._id });

    req = {
      params: { userId: landlordUser._id.toString() },
      body: {
        title: "Property Owner",
        address: "Test Address",
        city: "Chandigarh",
        propertyTypes: ["Residential"],
        isCompany: false,
        totalProperties: 3,
        status: "active",
        preferences: { contactMethod: "whatsapp", acceptsVisits: true },
      },
    };
    res = stubRes();
    await createLandlordByUserId(req, res);
    console.log(`[4] create landlord → ${res.statusCode}`, JSON.stringify(res.body?.message));
    if (res.statusCode !== 201) throw new Error("expected 201");
    const landlordDoc = await Landlord.findOne({ userID: landlordUser._id });
    console.log(
      `    profile: name=${landlordDoc.name} city=${landlordDoc.city} props=${landlordDoc.totalProperties} contact=${landlordDoc.preferences?.contactMethod} slug=${landlordDoc.slug}`,
    );
    created.landlords.push(landlordDoc._id);

    console.log("\n✅ ALL CREATE-PROFILE TESTS PASSED");
  } finally {
    // Cleanup test data
    for (const id of created.agents) await Agent.deleteOne({ _id: id });
    for (const id of created.landlords) await Landlord.deleteOne({ _id: id });
    for (const id of created.users) await User.deleteOne({ _id: id });
    await mongoose.disconnect();
    console.log("🧹 cleanup done");
  }
};

run().catch((err) => {
  console.error("❌ TEST FAILED:", err.message);
  process.exit(1);
});
