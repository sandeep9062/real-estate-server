import Journal from "../models/Journal.js";
import asyncHandler from "express-async-handler";

// @desc    Create new journal post
// @route   POST /api/journals
// @access  Private/Admin
const createJournal = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    category,
    excerpt,
    content,
    targetSector,
    metaTitle,
    keywords,
    isActive,
  } = req.body;
  const coverImage = req.file ? req.file.secure_url : null;

  const journalExists = await Journal.findOne({ title });

  if (journalExists) {
    res.status(400);
    throw new Error("Journal post with this title already exists");
  }

  let parsedKeywords = keywords;
  if (typeof keywords === "string") {
    try {
      parsedKeywords = JSON.parse(keywords);
    } catch {
      parsedKeywords = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }
  }

  const journal = new Journal({
    title,
    slug: slug
      ? slug.toLowerCase().replace(/ /g, "-")
      : title.toLowerCase().replace(/ /g, "-"),
    category,
    excerpt,
    isActive,
    content,
    coverImage,
    targetSector,
    metaTitle,
    keywords: parsedKeywords,
  });

  const createdJournal = await journal.save();
  res.status(201).json(createdJournal);
});

// @desc    Get all journal posts (with pagination) — only active posts
// @route   GET /api/journals
// @access  Public
const getJournals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build optional filter based on query params
  const filter = { isActive: true };
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.sector) {
    filter.targetSector = req.query.sector;
  }

  const total = await Journal.countDocuments(filter);
  const journals = await Journal.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    journals,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
    hasNextPage: page * limit < total,
  });
});

// @desc    Get all distinct journal categories (from active journals only)
// @route   GET /api/journals/categories
// @access  Public
const getJournalCategories = asyncHandler(async (req, res) => {
  const categories = await Journal.distinct("category", { isActive: true });
  res.json({
    success: true,
    categories: categories.filter(Boolean),
  });
});

// @desc    Get journal post by ID (only if active)
// @route   GET /api/journals/:id
// @access  Public
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (journal) {
    res.json(journal);
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @desc    Update journal post
// @route   PUT /api/journals/:id
// @access  Private/Admin
const updateJournal = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    category,
    excerpt,
    content,
    targetSector,
    metaTitle,
    isActive,
    keywords,
  } = req.body;
  const coverImage = req.file ? req.file.secure_url : null;

  const journal = await Journal.findById(req.params.id);

  if (journal) {
    journal.title = title || journal.title;
    journal.slug = slug
      ? slug.toLowerCase().replace(/ /g, "-")
      : title
        ? title.toLowerCase().replace(/ /g, "-")
        : journal.slug;
    journal.category = category || journal.category;
    journal.excerpt = excerpt || journal.excerpt;
    journal.content = content || journal.content;
    journal.coverImage = coverImage || journal.coverImage;
    journal.targetSector = targetSector || journal.targetSector;
    journal.metaTitle = metaTitle || journal.metaTitle;
    if (isActive !== undefined) {
      journal.isActive = isActive;
    }
    if (keywords !== undefined) {
      if (typeof keywords === "string") {
        try {
          journal.keywords = JSON.parse(keywords);
        } catch {
          journal.keywords = keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
        }
      } else {
        journal.keywords = keywords;
      }
    }

    const updatedJournal = await journal.save();
    res.json(updatedJournal);
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @desc    Delete journal post
// @route   DELETE /api/journals/:id
// @access  Private/Admin
const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

  if (journal) {
    await journal.deleteOne();
    res.json({ message: "Journal post removed" });
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @desc    Get journal post by slug (only if active)
// @route   GET /api/journals/slug/:slug
// @access  Public
const getJournalBySlug = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (journal) {
    res.json(journal);
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @desc    Get all journal slugs for sitemap (only active journals)
// @route   GET /api/journals/sitemap-data
// @access  Public
const getJournalsForSitemap = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ isActive: true }, "slug updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    success: true,
    count: journals.length,
    data: journals,
  });
});

// @desc    Get ALL journal posts (including inactive) — for admin dashboard
// @route   GET /api/journals/all
// @access  Private/Admin
const getAllJournals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.sector) {
    filter.targetSector = req.query.sector;
  }

  const total = await Journal.countDocuments(filter);
  const journals = await Journal.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    journals,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
    hasNextPage: page * limit < total,
  });
});

export {
  createJournal,
  getJournals,
  getAllJournals,
  getJournalById,
  getJournalBySlug,
  getJournalCategories,
  updateJournal,
  deleteJournal,
  getJournalsForSitemap,
};
