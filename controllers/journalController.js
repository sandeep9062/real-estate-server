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

// author arrives as a JSON string from FormData; parse into { name, role, avatar }.
function parseAuthor(value) {
  if (!value) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

// Uploaded file wins; otherwise accept a pasted image URL from the form body.
// Works with both multer.single (req.file) and multer.fields (req.files).
function coverImageFromRequest(req) {
  const uploaded = req.files?.coverImage?.[0] || req.file;
  if (uploaded && uploaded.secure_url) return uploaded.secure_url;
  const fromBody = req.body ? req.body.coverImage : undefined;
  return nonEmptyString(fromBody) || null;
}

// Author avatar file uploaded via multer.fields (req.files.authorAvatar).
function authorAvatarFromRequest(req) {
  const uploaded = req.files?.authorAvatar?.[0];
  if (uploaded && uploaded.secure_url) return uploaded.secure_url;
  return null;
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

// @desc    Create new journal post
// @route   POST /api/journals
// @access  Private/Admin
/** Best-effort ISR revalidation. `POST /api/revalidate` is the only place where
 *  the server-only `revalidatePath`/`revalidateTag` can run — they cannot
 *  execute inside this Express process, and the public frontend never triggers
 *  writes (it is read-only and dependent on the backend). The backend calls
 *  this after a successful journal create/update/delete, which then revalidates
 *  the Next.js app's journal pages and tags. Never blocks the admin response. */
async function revalidateJournal({ action, slug }) {
  const nextJsAppUrl =
    process.env.NEXTJS_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "https://www.propertybulbul.com";
  try {
    void (async () => {
      const nextJsAppUrl =
        process.env.NEXTJS_APP_URL ||
        process.env.NEXT_PUBLIC_URL ||
        "https://www.propertybulbul.com";
      try {
        await fetch(`${nextJsAppUrl}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": process.env.ADMIN_REVALIDATE_SECRET,
          },
          body: JSON.stringify({ action, slug }),
        });
      } catch (err) {
        console.warn("Journal revalidation queue failed:", err);
      }
    })();
  } catch (err) {
    console.warn("Journal revalidation queue failed:", err);
  }
}

const createJournal = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    category,
    excerpt,
    content,
    targetSector,
    metaTitle,
    metaDescription,
    keywords,
    tags,
    relatedSlugs,
    canonicalUrl,
    noIndex,
    status,
    targetCity,
    isActive,
    isFeatured,
    altText,
    author,
  } = req.body;
  const coverImage = coverImageFromRequest(req);
  const authorAvatar = authorAvatarFromRequest(req);

  // author arrives as a JSON string from FormData (object type).
  const parsedAuthor = parseAuthor(author);

  if (!title || !String(title).trim()) {
    res.status(400);
    throw new Error("Title is required");
  }

  const journalExists = await Journal.findOne({ title: String(title).trim() });

  if (journalExists) {
    res.status(400);
    throw new Error("Journal post with this title already exists");
  }

  const parsedKeywords = parseKeywordsValue(keywords);
  const parsedTags = parseKeywordsValue(tags);
  const activeFlag = parseBooleanFlag(isActive);
  const featuredFlag = parseBooleanFlag(isFeatured);
  const statusFlag = status || "published";

  const journal = new Journal({
    title: String(title).trim(),
    slug: slug && String(slug).trim() ? slugify(slug) : slugify(title),
    category,
    excerpt,
    status: statusFlag,
    isActive: activeFlag === undefined ? true : activeFlag,
    isFeatured: featuredFlag === undefined ? false : featuredFlag,
    content: normalizeMarkdown(content || ""),
    coverImage,
    altText,
    author: parsedAuthor ?? { name: "PropertyBulbul Editorial" },
    targetCity,
    targetSector,
    metaTitle,
    metaDescription: nonEmptyString(metaDescription),
    keywords: parsedKeywords,
    tags: parsedTags,
    relatedSlugs: parseKeywordsValue(relatedSlugs),
    canonicalUrl: nonEmptyString(canonicalUrl),
    noIndex:
      parseBooleanFlag(noIndex) === undefined
        ? false
        : parseBooleanFlag(noIndex),
    ...(authorAvatar ? { "author.avatar": authorAvatar } : {}),
  });

  try {
    const createdJournal = await journal.save();
    revalidateJournal({ action: "create", slug: createdJournal.slug });
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
  const filter = { isActive: true };
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
    status,
    category,
    excerpt,
    content,
    targetCity,
    targetSector,
    metaTitle,
    metaDescription,
    canonicalUrl,
    noIndex,
    isActive,
    isFeatured,
    keywords,
    tags,
    relatedSlugs,
    altText,
    author,
    removeCover,
    removeAuthorAvatar,
  } = req.body;
  const coverImage = coverImageFromRequest(req);
  const authorAvatar = authorAvatarFromRequest(req);
  const statusFlag = status || "published";
  // author arrives as a JSON string from FormData (object type).
  const parsedAuthor = parseAuthor(author);

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
    journal.slug = slugify(slug);
  }
  // Update semantics: empty-string title/content/slug are IGNORED (never
  // cleared). Only excerpt, metaTitle, altText, targetSector and category
  // may be cleared by sending an empty string.
  if (category !== undefined) journal.category = category;
  if (status !== undefined) journal.status = statusFlag;
  if (excerpt !== undefined) journal.excerpt = excerpt;
  if (content !== undefined && String(content).trim())
    journal.content = normalizeMarkdown(content);
  if (coverImage) journal.coverImage = coverImage;
  // Explicit cover removal (FormData sends "true" as a string).
  if (removeCover === true || removeCover === "true") journal.coverImage = "";
  if (targetSector !== undefined) journal.targetSector = targetSector;
  if (metaTitle !== undefined) journal.metaTitle = metaTitle;
  if (metaDescription !== undefined)
    journal.metaDescription = nonEmptyString(metaDescription);
  if (canonicalUrl !== undefined)
    journal.canonicalUrl = nonEmptyString(canonicalUrl);
  if (noIndex !== undefined) journal.noIndex = parseBooleanFlag(noIndex);
  if (altText !== undefined) journal.altText = altText;
  if (status !== undefined) journal.status = status;
  if (tags !== undefined) journal.tags = parseKeywordsValue(tags);
  if (relatedSlugs !== undefined)
    journal.relatedSlugs = parseKeywordsValue(relatedSlugs);
  if (parsedAuthor) journal.author = { ...journal.author, ...parsedAuthor };
  if (authorAvatar) journal.author.avatar = authorAvatar;
  if (removeAuthorAvatar === true || removeAuthorAvatar === "true")
    journal.author.avatar = "";
  const activeFlag = parseBooleanFlag(isActive);
  if (activeFlag !== undefined) {
    journal.isActive = activeFlag;
  }
  const featuredFlag = parseBooleanFlag(isFeatured);
  if (featuredFlag !== undefined) {
    journal.isFeatured = featuredFlag;
  }
  const parsedKeywords = parseKeywordsValue(keywords);
  if (parsedKeywords !== undefined) {
    journal.keywords = parsedKeywords;
  }

  try {
    const updatedJournal = await journal.save();
    // Best-effort: tell the Next.js app to revalidate the updated journal.
    revalidateJournal({ action: "update", slug: updatedJournal.slug });
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
    await journal.deleteOne();
    // Best-effort: tell the Next.js app to revalidate the removed journal.
    revalidateJournal({ action: "delete", slug: journal.slug });
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

// @desc    Track a view when the public journal detail page is opened
// @route   POST /api/journals/:slug/view
// @access  Public
const trackJournalView = asyncHandler(async (req, res) => {
  // Atomic increment so concurrent page opens never lose a count.
  const journal = await Journal.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
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
  const { page, limit } = clampPagination(req.query, 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.sector) {
    filter.targetSector = req.query.sector;
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
