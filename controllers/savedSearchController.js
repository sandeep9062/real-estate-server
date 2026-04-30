import asyncHandler from "express-async-handler";
import SavedSearch from "../models/SavedSearch.js";

export const listSavedSearches = asyncHandler(async (req, res) => {
  const items = await SavedSearch.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();
  res.json(items);
});

export const createSavedSearch = asyncHandler(async (req, res) => {
  const { name, filters = {}, notifyEmail = true, notifyInApp = true } = req.body;

  const doc = await SavedSearch.create({
    user: req.user._id,
    name: name || "My search",
    filters,
    notifyEmail: !!notifyEmail,
    notifyInApp: !!notifyInApp,
    cursorAt: new Date(),
  });
  res.status(201).json(doc);
});

export const updateSavedSearch = asyncHandler(async (req, res) => {
  const doc = await SavedSearch.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!doc) {
    res.status(404);
    throw new Error("Saved search not found");
  }

  const {
    name,
    filters,
    notifyEmail,
    notifyInApp,
    isActive,
    cursorAt,
  } = req.body;

  if (name !== undefined) doc.name = name;
  if (filters !== undefined) doc.filters = filters;
  if (notifyEmail !== undefined) doc.notifyEmail = !!notifyEmail;
  if (notifyInApp !== undefined) doc.notifyInApp = !!notifyInApp;
  if (isActive !== undefined) doc.isActive = !!isActive;
  if (cursorAt !== undefined) doc.cursorAt = new Date(cursorAt);

  await doc.save();
  res.json(doc);
});

export const deleteSavedSearch = asyncHandler(async (req, res) => {
  const result = await SavedSearch.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Saved search not found");
  }

  res.json({ success: true });
});
