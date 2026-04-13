import Journal from "../models/Journal.js";
import asyncHandler from "express-async-handler";

// @desc    Create new journal post
// @route   POST /api/journals
// @access  Private/Admin
const createJournal = asyncHandler(async (req, res) => {
  const { title, category, excerpt, content, targetSector } = req.body;
  const coverImage = req.file ? req.file.secure_url : null;

  const journalExists = await Journal.findOne({ title });

  if (journalExists) {
    res.status(400);
    throw new Error("Journal post with this title already exists");
  }

  const journal = new Journal({
    title,
    slug: title.toLowerCase().replace(/ /g, "-"), // Generate slug from title
    category,
    excerpt,
    content,
    coverImage,
    targetSector,
  });

  const createdJournal = await journal.save();
  res.status(201).json(createdJournal);
});

// @desc    Get all journal posts
// @route   GET /api/journals
// @access  Public
const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({});
  res.json(journals);
});

// @desc    Get journal post by ID
// @route   GET /api/journals/:id
// @access  Public
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

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
  const { title, category, excerpt, content, targetSector } = req.body;
  const coverImage = req.file ? req.file.secure_url : null;

  const journal = await Journal.findById(req.params.id);

  if (journal) {
    journal.title = title || journal.title;
    journal.slug = title
      ? title.toLowerCase().replace(/ /g, "-")
      : journal.slug; // Update slug if title changes
    journal.category = category || journal.category;
    journal.excerpt = excerpt || journal.excerpt;
    journal.content = content || journal.content;
    journal.coverImage = coverImage || journal.coverImage;
    journal.targetSector = targetSector || journal.targetSector;

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

// @desc    Get journal post by slug
// @route   GET /api/journals/slug/:slug
// @access  Public
const getJournalBySlug = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ slug: req.params.slug });

  if (journal) {
    res.json(journal);
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

export {
  createJournal,
  getJournals,
  getJournalById,
  getJournalBySlug,
  updateJournal,
  deleteJournal,
};
