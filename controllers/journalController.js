import Journal from "../models/Journal.js";
import asyncHandler from "express-async-handler";
import {
  normalizeMarkdown,
  slugify,
  parseBooleanFlag,
} from "../utils/markdown.js";

// Parse keywords/tags arriving as an array or as a JSON/comma string
// (multipart FormData always sends strings).
function parseKeywordsValue(keywords) {
  if (keywords === undefined || keywords === null) return undefined;
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords !== "string") return keywords;
  const trimmed = keywords.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return trimmed
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
}

const ALLOWED_JOURNAL_STATUSES = ["draft", "published", "archived"];

function parseJournalStatus(value) {
  if (value === undefined || value === null) return undefined;
  const candidate = String(value).trim().toLowerCase();
  return ALLOWED_JOURNAL_STATUSES.includes(candidate) ? candidate : undefined;
}

// Normalize author to { name, role, avatar }.
// FormData sends objects as JSON strings, so try to parse those first.
function normalizeAuthor(value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("{")) {
      try {
        return normalizeAuthor(JSON.parse(trimmed));
      } catch {
        /* fall through: treat as plain name */
      }
    }
    return { name: trimmed };
  }

  if (typeof value === "object") {
    const { name, role, avatar } = value;
    const out = {};
    if (typeof name === "string" && name.trim()) out.name = name.trim();
    if (typeof role === "string" && role.trim()) out.role = role.trim();
    if (typeof avatar === "string" && avatar.trim()) out.avatar = avatar.trim();
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

function duplicateKeyMessage(err) {
  const keyValue = err.keyValue || {};
  const pattern = err.keyPattern || {};
  const fields = Object.keys(keyValue).length
    ? Object.keys(keyValue)
    : Object.keys(pattern);
  if (fields.includes("slug")) return "A journal with this slug already exists";
  if (fields.includes("title"))
    return "A journal with this title already exists";
  return "A journal with this slug or title already exists";
}

function nonEmptyString(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

// Trim and cut to the schema's max length so validation never rejects a save.
function clampText(value, max) {
  if (typeof value !== "string") return value;
  return value.trim().slice(0, max);
}

// Uploaded file wins; otherwise accept a pasted image URL from the form body.
function coverImageFromRequest(req) {
  if (req.file && (req.file.secure_url || req.file.path))
    return req.file.secure_url || req.file.path;
  const fromBody = req.body ? req.body.coverImage : undefined;
  return nonEmptyString(fromBody) || undefined;
}

function clampPagination(query, defaultLimit) {
  let page = parseInt(query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(limit)) limit = defaultLimit;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  return { page, limit };
}

// @desc    Create journal post
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
    targetCity,
    series,
    articleNumber,
    metaTitle,
    metaDescription,
    keywords,
    tags,
    status,
    isFeatured,
    altText,
    author,
  } = req.body;

  const cleanTitle = nonEmptyString(title);
  const cleanContent = nonEmptyString(content);
  if (!cleanTitle || !cleanContent) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const statusValue = parseJournalStatus(status);
  const featuredFlag = parseBooleanFlag(isFeatured);
  const authorValue = normalizeAuthor(author);
  const cleanExcerpt = clampText(excerpt, 300);
  const metaDescriptionValue = clampText(
    nonEmptyString(metaDescription) || cleanExcerpt || "",
    170,
  );
  const parsedKeywords = parseKeywordsValue(keywords);
  const parsedTags = parseKeywordsValue(tags);
  const finalSlug = nonEmptyString(slug) ? slugify(slug) : slugify(cleanTitle);

  if (!finalSlug) {
    res.status(400);
    throw new Error("Could not generate a valid slug from the title");
  }

  const journal = new Journal({
    title: cleanTitle,
    slug: finalSlug,
    category: nonEmptyString(category) || "Investment",
    excerpt: cleanExcerpt,
    status: statusValue,
    isFeatured: featuredFlag === undefined ? false : featuredFlag,
    content: normalizeMarkdown(cleanContent),
    coverImage: coverImageFromRequest(req),
    altText,
    author: authorValue,
    targetSector,
    targetCity,
    series,
    articleNumber: articleNumber ? Number(articleNumber) : undefined,
    metaTitle: clampText(metaTitle, 70),
    metaDescription: metaDescriptionValue,
    keywords: parsedKeywords,
    tags: parsedTags,
  });

  try {
    const createdJournal = await journal.save();
    res.status(201).json(createdJournal);
  } catch (err) {
    if (err && err.code === 11000) {
      res.status(400);
      throw new Error(duplicateKeyMessage(err));
    }
    if (err && err.name === "ValidationError") {
      res.status(400);
      throw new Error(err.message);
    }
    throw err;
  }
});

// @desc    Get all published journal posts
// @route   GET /api/journals
// @access  Public
const getJournals = asyncHandler(async (req, res) => {
  const { page, limit } = clampPagination(req.query, 100);
  const skip = (page - 1) * limit;

  const filter = { status: "published", deletedAt: null };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.sector) filter.targetSector = req.query.sector;
  if (req.query.exclude) filter.slug = { $ne: req.query.exclude };

  const total = await Journal.countDocuments(filter);
  const journals = await Journal.find(filter)
    .select("-content")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    journals,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
    hasNextPage: page * limit < total,
  });
});

// @route   GET /api/journals/categories
const getJournalCategories = asyncHandler(async (req, res) => {
  const categories = await Journal.distinct("category", {
    status: "published",
    deletedAt: null,
  });
  res.json({
    success: true,
    categories: categories.filter(Boolean),
  });
});

// @route   GET /api/journals/:id  (admin)
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    _id: req.params.id,
    deletedAt: null,
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
    targetCity,
    series,
    articleNumber,
    metaTitle,
    metaDescription,
    keywords,
    tags,
    status,
    isFeatured,
    altText,
    author,
    removeCover,
  } = req.body;
  const coverImage = coverImageFromRequest(req);

  const journal = await Journal.findOne({
    _id: req.params.id,
    deletedAt: null,
  });

  if (!journal) {
    res.status(404);
    throw new Error("Journal post not found");
  }

  if (title !== undefined && String(title).trim()) {
    const trimmedTitle = String(title).trim();
    if (trimmedTitle !== journal.title) {
      const conflict = await Journal.findOne({
        title: trimmedTitle,
        deletedAt: null,
        _id: { $ne: journal._id },
      });
      if (conflict) {
        res.status(400);
        throw new Error("Another journal post with this title already exists");
      }
      journal.title = trimmedTitle;
    }
  }

  // Slug rule: never regenerate from the title. Only change when an explicit,
  // different (normalized) slug is sent; keep the old one in slugHistory.
  if (slug !== undefined && String(slug).trim()) {
    const newSlug = slugify(slug);
    if (newSlug && newSlug !== journal.slug) {
      const history = (journal.slugHistory || []).filter((s) => s !== newSlug);
      journal.slugHistory = [journal.slug, ...history];
      journal.slug = newSlug;
    }
  }

  if (category !== undefined && String(category).trim())
    journal.category = String(category).trim();
  if (excerpt !== undefined) journal.excerpt = clampText(excerpt, 300);
  if (content !== undefined && String(content).trim())
    journal.content = normalizeMarkdown(content);
  if (coverImage) journal.coverImage = coverImage;
  if (removeCover === true || removeCover === "true") journal.coverImage = "";
  if (targetSector !== undefined) journal.targetSector = targetSector;
  if (targetCity !== undefined) journal.targetCity = targetCity;
  if (series !== undefined) journal.series = series;
  if (articleNumber !== undefined)
    journal.articleNumber = articleNumber ? Number(articleNumber) : undefined;
  if (metaTitle !== undefined) journal.metaTitle = clampText(metaTitle, 70);
  if (metaDescription !== undefined)
    journal.metaDescription = clampText(metaDescription, 170);
  if (altText !== undefined) journal.altText = altText;

  if (author !== undefined) {
    const authorValue = normalizeAuthor(author);
    if (authorValue)
      journal.author = { ...journal.author?.toObject?.(), ...authorValue };
  }

  const statusValue = parseJournalStatus(status);
  if (statusValue !== undefined) journal.status = statusValue;

  const featuredFlag = parseBooleanFlag(isFeatured);
  if (featuredFlag !== undefined) journal.isFeatured = featuredFlag;

  const parsedTags = parseKeywordsValue(tags);
  const parsedKeywords = parseKeywordsValue(keywords);
  if (parsedTags !== undefined) journal.tags = parsedTags;
  if (parsedKeywords !== undefined) journal.keywords = parsedKeywords;

  try {
    // validateModifiedOnly: old documents with legacy/invalid fields that
    // aren't being touched must not block the save.
    const updatedJournal = await journal.save({ validateModifiedOnly: true });
    res.json(updatedJournal);
  } catch (err) {
    if (err && err.code === 11000) {
      res.status(400);
      throw new Error(duplicateKeyMessage(err));
    }
    if (err && err.name === "ValidationError") {
      res.status(400);
      throw new Error(err.message);
    }
    throw err;
  }
});

// @desc    Soft-delete journal post
// @route   DELETE /api/journals/:id
// @access  Private/Admin
const deleteJournal = asyncHandler(async (req, res) => {
  // updateOne skips full-document validation, so legacy docs can still be deleted.
  const result = await Journal.updateOne(
    { _id: req.params.id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    res.status(404);
    throw new Error("Journal post not found");
  }
  res.json({ message: "Journal post removed" });
});

// @route   GET /api/journals/slug/:slug
const getJournalBySlug = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    slug: req.params.slug,
    status: "published",
    deletedAt: null,
  });

  if (journal) {
    res.json(journal);
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @route   POST /api/journals/:slug/view
const trackJournalView = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndUpdate(
    { slug: req.params.slug, status: "published", deletedAt: null },
    { $inc: { views: 1 } },
    { new: true, select: "views" },
  );

  if (journal) {
    res.json({ success: true, views: journal.views });
  } else {
    res.status(404);
    throw new Error("Journal post not found");
  }
});

// @route   GET /api/journals/sitemap-data
const getJournalsForSitemap = asyncHandler(async (req, res) => {
  const journals = await Journal.find(
    { status: "published", deletedAt: null },
    "slug updatedAt",
  )
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    success: true,
    count: journals.length,
    data: journals,
  });
});

// @desc    Get ALL non-deleted journals (any status) — admin dashboard
// @route   GET /api/journals/all
// @access  Private/Admin
const getAllJournals = asyncHandler(async (req, res) => {
  const { page, limit } = clampPagination(req.query, 10);
  const skip = (page - 1) * limit;

  const filter = { deletedAt: null }; // soft-deleted journals must not show up
  if (req.query.category) filter.category = req.query.category;
  if (req.query.sector) filter.targetSector = req.query.sector;
  if (req.query.city) filter.targetCity = req.query.city;

  const total = await Journal.countDocuments(filter);
  const journals = await Journal.find(filter)
    .select("-content")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

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
  trackJournalView,
};
