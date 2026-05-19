import express from "express";
import MarketIndex from "../models/MarketIndex.js";
import { generateMarketIndex } from "../utils/marketIndex.js";

const router = express.Router();

// ─── GET /api/market-index ───────────────────────────────────────────────────
// Returns latest report. Public, no auth needed.
router.get("/", async (req, res) => {
  try {
    const latest = await MarketIndex.findOne().sort({ generatedAt: -1 });
    if (!latest) {
      return res.status(404).json({
        error:
          "No report generated yet. Run POST /api/market-index/generate first.",
      });
    }
    res.json(latest);
  } catch (err) {
    console.error("[market-index GET]", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/market-index/history ──────────────────────────────────────────
// Last 8 quarters — for trend charts later
router.get("/history", async (req, res) => {
  try {
    const reports = await MarketIndex.find()
      .sort({ generatedAt: -1 })
      .select("quarter year generatedAt totalListings");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/market-index/debug ────────────────────────────────────────────
// Temporary — inspect raw property data to debug aggregation field issues
router.get("/debug", async (req, res) => {
  try {
    const Property = (await import("../models/Property.js")).default;
    const sample = await Property.findOne({ isActive: true }).lean();
    const count = await Property.countDocuments({ isActive: true });
    res.json({ count, sampleFields: Object.keys(sample || {}), sample });
  } catch (err) {
    console.error("[market-index debug]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/market-index/generate ────────────────────────────────────────
// Admin-only. Run manually or via cron every quarter.
// Header: x-admin-secret: <ADMIN_SECRET env var>
router.post("/generate", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { rentData, saleData, yieldData, totalListings } =
      await generateMarketIndex();

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}-${now.getFullYear()}`;

    const report = await MarketIndex.create({
      quarter,
      year: now.getFullYear(),
      rentData,
      saleData,
      yieldData,
      totalListings,
    });

    res.status(201).json({
      message: `Report ${quarter} generated successfully`,
      id: report._id,
      stats: {
        rentSectors: rentData.length,
        saleSectors: saleData.length,
        yieldPairs: yieldData.length,
        totalListings,
      },
    });
  } catch (err) {
    console.error("[market-index generate]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/market-index/sector/:sector ───────────────────────────────────
// Drill-down for a single sector — used by property listing pages
router.get("/sector/:sector", async (req, res) => {
  try {
    const latest = await MarketIndex.findOne().sort({ generatedAt: -1 });
    if (!latest) return res.status(404).json({ error: "No report yet" });

    const name = decodeURIComponent(req.params.sector);
    res.json({
      quarter: latest.quarter,
      rent: latest.rentData.filter((r) => r.sector === name),
      sale: latest.saleData.filter((r) => r.sector === name),
      yield: latest.yieldData.filter((r) => r.sector === name),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
