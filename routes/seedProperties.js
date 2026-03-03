import express from "express";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import properties from "../data/properties.js";
const router = express.Router();

router.post("/seed", async (req, res) => {
  try {
    // const userId = req.body.userId;

    // if (!userId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User ID is required for seeding",
    //   });
    // }

    // 🔥 Prevent duplicates using slug
    const operations = properties.map((property) => ({
      updateOne: {
        filter: { "location.slug": property.location.slug },
        update: { $setOnInsert: property },
        upsert: true,
      },
    }));

    const result = await Property.bulkWrite(operations);

    return res.status(200).json({
      success: true,
      message: "Seeding completed",
      insertedCount: result.upsertedCount,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      success: false,
      message: "Seeding failed",
    });
  }
});

export default router;
