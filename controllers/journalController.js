import Journal from "../models/Journal.js";
import asyncHandler from "express-async-handler";
import {
  normalizeMarkdown,
  slugify,
  parseBooleanFlag,
} from "../utils/markdown.js";

// Parse keywords arriving either as an array or as a JSON/comma string
// (multipart FormData always sends strings).
function parseKeywordsValue(keywords) {
  if (keywords === undefined || keywords === null) return undefined;
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords !== "string") return keywords;
  const trimmed = keywords.trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
}

// Journal status is the model's publication state (draft | published | archived).
// The model strips unknown fields, so a boolean `isActive` would be ignored and
// every new journal would land in the default `draft` status.
const ALLOWED_JOURNAL_STATUSES = ["draft", "published", "archived"];

function parseJournalStatus(value) {
  if (value === undefined || value === null) return undefined;
  const candidate = String(value).trim().toLowerCase();
  return ALLOWED_JOURNAL_STATUSES.includes(candidate) ? candidate : undefined;
}

// Normalize author to the rich { name, role, avatar } shape.
// Accepts a plain string (backward-compat) or an object; missing name falls
// back to the model default "PropertyBulbul Editorial".
function normalizeAuthor(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? { name: trimmed } : undefined;
  }
  if (typeof value === "object") {
    const { name, role, avatar } = value;
    return {
      name: typeof name === "string" && name.trim() ? name.trim() : undefined,
      role: typeof role === "string" && role.trim() ? role.trim() : undefined,
      avatar: typeof avatar === "string" && avatar.trim() ? avatar.trim() : undefined,
    };
  }
  return undefined;
}

// Clear 400 message for Mongo duplicate-key errors (slug or title).
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

// Trimmed non-empty string, or undefined when missing/blank.
function nonEmptyString(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

// Uploaded file wins; otherwise accept a pasted image URL from the form body.
function coverImageFromRequest(req) {
  if (req.file && req.file.secure_url) return req.file.secure_url;
  const fromBody = req.body ? req.body.coverImage : undefined;
  return nonEmptyString(fromBody) || null;
}

// Clamp pagination: page >= 1, 1 <= limit <= 100.
function clampPagination(query, defaultLimit) {
  let page = parseInt(query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(limit)) limit = defaultLimit;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  return { page, limit };
}

  const statusValue = parseJournalStatus(status);
  const featuredFlag = parseBooleanFlag(isFeatured);
  const metaDescriptionValue = metaDescription || excerpt;
  const authorValue = normalizeAuthor(author);

  const journal = new Journal({
    title: String(title).trim(),
    slug: slug && String(slug).trim() ? slugify(slug) : slugify(title),
    category,
    excerpt,
    status: statusValue,
    isFeatured: featuredFlag === undefined ? false : featuredFlag,
    content: normalizeMarkdown(content || ""),
    coverImage,
    altText,
    author: authorValue,
    targetSector,
    targetCity,
    series,
    articleNumber: articleNumber ? Number(articleNumber) : undefined,
    metaTitle,
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
    throw err;
  }
});

// @desc    Get all journal posts (with pagination) — only active posts
// @route   GET /api/journals
// @access  Public
const getJournals = asyncHandler(async (req, res) => {
  // Clamp pagination so a client can never force the DB to return/index an
  // unbounded number of documents in a single request.
  const { page, limit } = clampPagination(req.query, 100);
  const skip = (page - 1) * limit;

  // Build optional filter based on query params
  const filter = { status: "published", deletedAt: null };
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.sector) {
    filter.targetSector = req.query.sector;
  }
  // Lets related-article queries omit the article being viewed.
  if (req.query.exclude) {
    filter.slug = { $ne: req.query.exclude };
  }

  const total = await Journal.countDocuments(filter);
  // CRITICAL for load speed: exclude the full HTML `content` body from list
  // responses. Cards never render it, and 100 full article bodies can be
  // megabytes of JSON/HTML that delay first paint (detail pages fetch the
  // content via the slug endpoint instead).
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

// @desc    Get all distinct journal categories (from active journals only)
// @route   GET /api/journals/categories
// @access  Public
const getJournalCategories = asyncHandler(async (req, res) => {
  const categories = await Journal.distinct("category", {
    status: "published",
  });
  res.json({
    success: true,
    categories: categories.filter(Boolean),
  });
});

// @desc    Get journal post by ID (any status except soft-deleted)
// @route   GET /api/journals/:id
// @access  Private/Admin
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
  const {
    title,
    slug,
    category,
    excerpt,
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
  const coverImage = coverImageFromRequest(req);

  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    res.status(404);
    throw new Error("Journal post not found");
  }

  if (title !== undefined && String(title).trim()) {
    const trimmedTitle = String(title).trim();
    const conflict = await Journal.findOne({
      title: trimmedTitle,
      _id: { $ne: journal._id },
    });
    if (conflict) {
      res.status(400);
      throw new Error("Another journal post with this title already exists");
    }
    journal.title = trimmedTitle;
  }
  // Slug rule: never regenerate from the title. Only act when the request
  // explicitly sends a slug, and do nothing when the sent value already
  // equals the stored slug -- a plain "open and save" must never rewrite
  // (or normalize) an existing URL, since changing live URLs hurts SEO.
  if (
    slug !== undefined &&
    String(slug).trim() &&
    String(slug) !== journal.slug
  ) {
    journal.slugHistory = [journal.slug, ...(journal.slugHistory || [])];
    journal.slug = slugify(slug);
  }
  // Update semantics: empty-string title/content/slug are IGNORED (never
  // cleared). Only excerpt, metaTitle, altText, targetSector and category
  // may be cleared by sending an empty string.
  if (category !== undefined) journal.category = category;
  if (excerpt !== undefined) journal.excerpt = excerpt;
  if (content !== undefined && String(content).trim())
    journal.content = normalizeMarkdown(content);
  if (coverImage) journal.coverImage = coverImage;
  // Explicit cover removal (FormData sends "true" as a string).
  if (removeCover === true || removeCover === "true") journal.coverImage = "";
  if (targetSector !== undefined) journal.targetSector = targetSector;
  if (targetCity !== undefined) journal.targetCity = targetCity;
  if (series !== undefined) journal.series = series;
  if (articleNumber !== undefined)
    journal.articleNumber = articleNumber ? Number(articleNumber) : undefined;
  if (metaTitle !== undefined) journal.metaTitle = metaTitle;
  if (metaDescription !== undefined) journal.metaDescription = metaDescription;
  if (altText !== undefined) journal.altText = altText;
  if (author !== undefined) journal.author = normalizeAuthor(author);
  const statusValue = parseJournalStatus(status);
  if (statusValue !== undefined) {
    journal.status = statusValue;
  }
  const featuredFlag = parseBooleanFlag(isFeatured);
  if (featuredFlag !== undefined) {
    journal.isFeatured = featuredFlag;
  }
  const parsedTags = parseKeywordsValue(tags);
  const parsedKeywords = parseKeywordsValue(keywords);
  if (parsedTags !== undefined) {
    journal.tags = parsedTags;
  }
  if (parsedKeywords !== undefined) {
    journal.keywords = parsedKeywords;
  }

  try {
    const updatedJournal = await journal.save();
  res.json(updatedJournal);
} catch (err) {
  if (err && err.code === 11000) {
    res.status(400);
    throw new Error(duplicateKeyMessage(err));
  }
  throw err;
}
});

// @desc    Delete journal post
// @route   DELETE /api/journals/:id
// @access  Private/Admin
const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

  if (journal) {
    journal.deletedAt = new Date();
    await journal.save();
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

// @desc    Track a view when the public journal detail page is opened
// @route   POST /api/journals/:slug/view
// @access  Public
const trackJournalView = asyncHandler(async (req, res) => {
  // Atomic increment so concurrent page opens never lose a count.
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

// @desc    Get all journal slugs for sitemap (only active journals)
// @route   GET /api/journals/sitemap-data
// @access  Public
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

// @desc    Get ALL journal posts (including inactive) — for admin dashboard
// @route   GET /api/journals/all
// @access  Private/Admin
const getAllJournals = asyncHandler(async (req, res) => {
  const { page, limit } = clampPagination(req.query, 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.sector) {
    filter.targetSector = req.query.sector;
  }
  if (req.query.city) {
    filter.targetCity = req.query.city;
  }

  const total = await Journal.countDocuments(filter);
  // List views never render the body, so exclude it for speed.
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
