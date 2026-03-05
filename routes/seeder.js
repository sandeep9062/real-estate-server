import express from "express";
import { developers } from "../data/developers.js";
import { projects } from "../data/projects.js";
import Developer from "../models/Developer.js";
import Project from "../models/Project.js";
import Property from "../models/Property.js";

const router = express.Router();

// Helper to generate URL-friendly slugs
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

router.post("/seed", async (req, res) => {
  try {
    // 1. Get total count of your 147 landlord properties
    const count = await Property.countDocuments();

    // 2. Clean up existing authority data
    await Developer.deleteMany({});
    await Project.deleteMany({});

    // 3. Insert Developers
    const createdDevs = await Developer.insertMany(developers);

    // 4. Prepare and Insert Projects
    const projectData = projects.map((p) => ({
      ...p,
      developer: createdDevs.find((d) => d.name === p.developerName)?._id,
      slug: slugify(p.name),
    }));
    const createdProjects = await Project.insertMany(projectData);

    // 5. Link Landlord Properties to these new Projects
    for (const project of createdProjects) {
      let keywords = [];
      if (project.name.includes("Sushma"))
        keywords = [
          /Sushma/i,
          /Aerocity/i,
          /Joynest/i,
          /Zirakpur/i,
          /Airport/i,
        ];
      if (project.name.includes("SBP"))
        keywords = [/SBP/i, /Dreams/i, /Sector 115/i, /Kharar/i, /Landran/i];
      if (project.name.includes("Hero"))
        keywords = [/Hero/i, /Sector 88/i, /Mohali/i];

      await Property.updateMany(
        {
          $or: [
            { "location.address": { $in: keywords } },
            { "location.sector": { $in: keywords } },
            { "location.city": { $in: keywords } },
            { title: { $in: keywords } },
            { description: { $in: keywords } },
          ],
        },
        { $set: { projectId: project._id, isVerified: true } },
      );
    }

    const finalLinked = await Property.countDocuments({ isVerified: true });

    res.status(200).json({
      success: true,
      message: "Seeding and linking finished.",
      totalProperties: count,
      verifiedProperties: finalLinked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Seeding failed",
      error: error.message,
    });
  }
});

export default router;
