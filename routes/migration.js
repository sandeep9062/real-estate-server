import express from "express";
import Property from "../models/Property.js"; // Ensure path and .js extension are correct

const router = express.Router();

/**
 * @route   POST /api/migrate-images
 * @desc    Renames the 'images' field to 'image' for all property documents
 * @access  Private/Admin (Recommended)
 */
router.post("/migrate", async (req, res) => {
  try {
    // 1. Rename 'images' to 'image' using MongoDB's atomic $rename operator
    // This is much faster than fetching and saving each document individually.
    const result = await Property.updateMany(
      { image: { $exists: true } }, // Only target docs that have the old key
      { $rename: { image: "media" } },
    );

    // 2. Handle cases where no documents needed updating
    if (result.matchedCount === 0) {
      return res.status(200).json({
        success: true,
        message:
          "No documents found with the 'images' field. Migration might already be complete.",
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property image fields renamed successfully.",
      details: {
        totalFound: result.matchedCount,
        totalUpdated: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Migration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during field migration.",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/migrate-slugs
 * @desc    Generate slugs for all properties missing one (title → URL-friendly slug)
 * @access  Private/Admin
 */
import slugify from "slugify";

router.post("/migrate-slugs", async (req, res) => {
  try {
    const missingSlugDocs = await Property.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    }).lean();

    if (missingSlugDocs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All properties already have a slug. Nothing to migrate.",
        totalProcessed: 0,
      });
    }

    let updated = 0;
    let errors = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < missingSlugDocs.length; i += BATCH_SIZE) {
      const batch = missingSlugDocs.slice(i, i + BATCH_SIZE);
      const operations = [];

      for (const doc of batch) {
        if (!doc.title || typeof doc.title !== "string") {
          errors++;
          continue;
        }

        const baseSlug = slugify(doc.title, {
          lower: true,
          strict: true,
          trim: true,
        });

        const suffix = doc._id.toString().slice(-6);
        const slug = `${baseSlug}-${suffix}`;

        operations.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { slug } },
          },
        });
      }

      if (operations.length > 0) {
        const result = await Property.bulkWrite(operations);
        updated +=
          result.modifiedCount ?? result.upsertedCount ?? operations.length;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Slug migration completed.",
      totalFound: missingSlugDocs.length,
      totalProcessed: updated,
      totalSkipped: errors,
    });
  } catch (error) {
    console.error("Slug Migration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during slug migration.",
      error: error.message,
    });
  }
});

export default router;
