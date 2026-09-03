import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Lead, {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_TYPES,
} from "../models/Lead.js";
import Property from "../models/Property.js";

const LEAD_SORT_FIELDS = new Set([
  "lastActivityAt",
  "createdAt",
  "updatedAt",
  "status",
]);

/**
 * @desc    Create a lead (from the WhatsApp Connect click on a listing page)
 * @route   POST /api/leads
 * @access  Public + optional auth (buyer may be anonymous). agentId is derived
 *          server-side from the property's owner — never trusted from the client.
 */
export const createLead = asyncHandler(async (req, res) => {
  const { propertyId, buyerName, buyerPhone, source } = req.body || {};

  if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({
      success: false,
      message: "A valid propertyId is required",
      code: "INVALID_PROPERTY",
    });
  }

  if (source !== undefined && !LEAD_SOURCES.includes(source)) {
    return res.status(400).json({
      success: false,
      message: `Invalid source. Allowed: ${LEAD_SOURCES.join(", ")}`,
    });
  }

  const property = await Property.findById(propertyId).select(
    "title user isActive deletedAt",
  );

  if (!property || property.deletedAt || property.isActive === false) {
    return res.status(404).json({
      success: false,
      message: "Property not found or no longer available",
    });
  }

  if (!property.user) {
    return res.status(404).json({
      success: false,
      message: "Listing owner not found",
    });
  }

  const lead = new Lead({
    propertyId: property._id,
    agentId: property.user,
    buyerName: buyerName || req.user?.name || null,
    buyerPhone: buyerPhone || req.user?.phone || null,
    source: source || "whatsapp_click",
    type: "WHATSAPP_CLICK",
    status: "New",
    notes: `WhatsApp connect click on "${property.title}"`,
    lastActivityAt: new Date(),
  });

  const createdLead = await lead.save();

  res.status(201).json({
    success: true,
    message: "Lead recorded",
    data: createdLead.toJSON(),
  });
});

/**
 * @desc    Get all leads for the authenticated agent (CRM/WhatsApp-click leads)
 * @route   GET /api/leads
 * @access  Private (agent/admin)
 * @query   status, propertyId, sortBy (default lastActivityAt), sortOrder (desc|asc)
 */
export const getLeads = asyncHandler(async (req, res) => {
  const { status, propertyId, sortBy = "lastActivityAt", sortOrder = "desc" } =
    req.query || {};

  const query = { agentId: req.user._id };

  if (status) {
    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${LEAD_STATUSES.join(", ")}`,
      });
    }
    query.status = status;
  }

  if (propertyId) {
    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid propertyId",
      });
    }
    query.propertyId = propertyId;
  }

  const sortField = LEAD_SORT_FIELDS.has(sortBy) ? sortBy : "lastActivityAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const leads = await Lead.find(query)
    .sort({ [sortField]: sortDirection })
    .populate("propertyId", "title slug image deal price location status")
    .lean();

  const data = leads.map((lead) => ({
    ...lead,
    id: lead._id.toString(),
    property: lead.propertyId,
    propertyId: undefined,
  }));

  res.json({ success: true, count: data.length, data });
});

/**
 * @desc    Get ALL leads across the platform (admin view).
 *          Returns both CRM (WhatsApp-click) leads and legacy brochure leads.
 * @route   GET /api/leads/admin/all
 * @access  Private/Admin
 * @query   status, source, type, agentId, sortBy, sortOrder
 */
export const getAllLeads = asyncHandler(async (req, res) => {
  const {
    status,
    source,
    type,
    agentId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query || {};

  const query = {};

  if (status) {
    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${LEAD_STATUSES.join(", ")}`,
      });
    }
    query.status = status;
  }

  if (source) {
    if (!LEAD_SOURCES.includes(source)) {
      return res.status(400).json({
        success: false,
        message: `Invalid source. Allowed: ${LEAD_SOURCES.join(", ")}`,
      });
    }
    query.source = source;
  }

  if (type) {
    if (!LEAD_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed: ${LEAD_TYPES.join(", ")}`,
      });
    }
    query.type = type;
  }

  if (agentId) {
    if (!mongoose.isValidObjectId(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agentId",
      });
    }
    // Legacy brochure leads store the owner in brokerId — match either.
    query.$or = [{ agentId }, { brokerId: agentId }];
  }

  const sortField = LEAD_SORT_FIELDS.has(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const leads = await Lead.find(query)
    .sort({ [sortField]: sortDirection })
    .populate("propertyId", "title slug image deal price location status")
    .populate("agentId", "name email phone role")
    .populate("brokerId", "name email phone role")
    .lean();

  // Normalize: expose `agent` (agentId or legacy brokerId) and `property`.
  const data = leads.map((lead) => ({
    ...lead,
    id: lead._id.toString(),
    property: lead.propertyId,
    propertyId: undefined,
    agent: lead.agentId || lead.brokerId || null,
    agentId: undefined,
    brokerId: undefined,
    // Surface buyer info from whichever field the lead kind uses.
    buyer: {
      name: lead.buyerName || lead.userName || null,
      phone: lead.buyerPhone || lead.userPhone || null,
    },
  }));

  res.json({ success: true, count: data.length, data });
});

/**
 * @desc    Update a lead's status and/or notes (agent-only, ownership verified)
 * @route   PATCH /api/leads/:id
 * @access  Private (agent/admin)
 */
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead id",
    });
  }

  const { status, notes } = req.body || {};

  if (status !== undefined && !LEAD_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${LEAD_STATUSES.join(", ")}`,
    });
  }

  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "notes must be a string",
    });
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  // Ownership check — only the agent the lead is assigned to may edit it.
  if (!lead.agentId || String(lead.agentId) !== String(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You don't own this lead.",
      code: "FORBIDDEN",
    });
  }

  let changed = false;
  if (status !== undefined && lead.status !== status) {
    lead.status = status;
    changed = true;
  }
  if (notes !== undefined && lead.notes !== notes) {
    lead.notes = notes;
    changed = true;
  }

  if (changed) {
    lead.lastActivityAt = new Date();
    await lead.save();
  }

  res.json({ success: true, data: lead.toJSON() });
});

/**
 * @desc    Simple stats for the authenticated agent
 * @route   GET /api/leads/stats
 * @access  Private (agent/admin)
 */
export const getLeadStats = asyncHandler(async (req, res) => {
  const agentId = req.user._id;

  // Start of the current week (Monday 00:00 local server time)
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  const weekday = startOfWeek.getDay(); // 0 = Sunday
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);

  const [total, totalThisWeek, statusRows, closed] = await Promise.all([
    Lead.countDocuments({ agentId }),
    Lead.countDocuments({ agentId, createdAt: { $gte: startOfWeek } }),
    Lead.aggregate([
      { $match: { agentId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Lead.countDocuments({ agentId, status: "Closed" }),
  ]);

  const byStatus = {};
  LEAD_STATUSES.forEach((s) => {
    byStatus[s] = 0;
  });
  statusRows.forEach((row) => {
    if (row._id !== null && row._id !== undefined) byStatus[row._id] = row.count;
  });

  const conversionRate = total > 0 ? (closed / total) * 100 : 0;

  res.json({
    success: true,
    data: {
      total,
      totalThisWeek,
      closed,
      conversionRate: Math.round(conversionRate * 10) / 10,
      byStatus,
    },
  });
});