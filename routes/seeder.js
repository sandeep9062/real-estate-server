import express from "express";
import Journal from "../models/Journal.js";
import { journals } from "../data/journal.js";

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
    // Seed Journal data

    const existingJournals = await Journal.find();
    // Journal.deleteMany({}).then(() => {
    //   console.log("Existing journal data cleared");
    // });
    if (existingJournals.length === 0) {
      const journalPromises = journals.map((journal) => {
        const journalData = {
          title: journal.title,
          slug: journal.slug,
          category: journal.category,
          excerpt: journal.excerpt,
          content: journal.content,
          coverImage: journal.coverImage,
          targetSector: journal.targetSector,
          createdAt: new Date(journal.createdAt),
        };
        return new Journal(journalData).save();
      });
      await Promise.all(journalPromises);
      console.log("Journal data seeded successfully");
    } else {
      console.log("Journal data already exists");
    }
  } catch (error) {
    console.error("Error seeding journal data:", error);
  }
});

export default router;
