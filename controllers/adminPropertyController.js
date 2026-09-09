import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import User from "../models/User.js";

/**
 * Admin-only property controller.
 *
 * Unlike the public controller (which whitelists a small set of fields),
 * these handlers accept EVERY field present in backend/models/Property.js
 * so the admin dashboard form can post full property details.
 */

// ── Enums mirrored from backend/models/Property.js ──────────────────────────
const DEALS = ["Rent", "Sale"];
const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
];
const PROPERTY_CATEGORIES = [
  "Apartment/Flat",
  "House/Villa",
  "Land/Plot",
  "Studio Apartment",
  "Builder Floor",
  "PG/Hostel",
  "Farmhouse",
  "Retail",
  "Office",
  "Industrial",
  "Warehouse",
  "Shop/Showroom",
];
const AREA_UNITS = ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"];
const AVAILABILITY = ["Ready to Move", "Under Construction"];
const FURNISHING = [
  "Furnished",
  "Fully Furnished",
  "Semi Furnished",
  "Un-Furnished",
];
const TENANT_PREFERENCES = [
  "Family",
  "Bachelors",
  "Any",
  "Working Professionals",
  "Students",
];
const POSTED_BY = ["Owner", "Agent", "Builder"];
const PREFERRED_CONTACT = ["Call", "WhatsApp", "Email"];
const OWNERSHIP_TYPES = [
  "Freehold",
  "Leasehold",
  "Co-operative",
  "Power of Attorney",
];
const OC_STATUS = ["Available", "Applied", "Not issued", "NA"];
const LISTING_AVAIL = [
  "Available",
  "Fresh",
  "Under offer",
  "Booked",
  "Sold",
  "Rented",
  "Review Required",
  "Non Available",
];
const PARKING_TYPES = ["None", "Open", "Covered", "Both"];
const SECURITY_FEATURES = ["CCTV", "Guard", "Biometric", "Gated"];
const WATER_SUPPLY = ["Municipal", "Borewell", "Both"];

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseMaybeJson(value) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseOptionalNumber(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalDate(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function coerceBool(v) {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return undefined;
}

function enumValue(v, allowed) {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim();
  return allowed.includes(s) ? s : undefined;
}

/** Accepts a JSON array or newline/comma separated text → trimmed string[]. */
function toStringArray(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const parsed = parseMaybeJson(v);
  if (Array.isArray(parsed)) {
    return parsed.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v
      .split(/\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return undefined;
}

function getUploadedImagesAndFloorPlans(req) {
  const f = req.files;
  if (!f) return { images: [], floorPlans: [] };
  if (Array.isArray(f)) {
    return { images: f.map((file) => file.path), floorPlans: [] };
  }
  const imgs = f.image || [];
  const fps = f.floorPlan || [];
  return {
    images: imgs.map((file) => file.path),
    floorPlans: fps.map((file) => file.path),
  };
}

/** Normalize { lat, lng } into GeoJSON Point, and trim strings. */
function normalizeLocation(rawLocation) {
  const location =
    typeof rawLocation === "string" ? parseMaybeJson(rawLocation) : rawLocation;
  if (!location || typeof location !== "object") return undefined;

  const normalized = { ...location };
  for (const key of [
    "address",
    "city",
    "sector",
    "state",
    "country",
    "slug",
    "pincode",
    "landmark",
  ]) {
    if (normalized[key] != null)
      normalized[key] = String(normalized[key]).trim();
  }
  const lat = parseOptionalNumber(normalized.coordinates?.lat) ?? 0;
  const lng = parseOptionalNumber(normalized.coordinates?.lng) ?? 0;
  normalized.coordinates = { type: "Point", coordinates: [lng, lat] };
  return normalized;
}

/**
 * Extracts EVERY Property-model field from the request body.
 * Fields that are absent stay `undefined` so updates can merge selectively.
 */
function extractPropertyPayload(req) {
  const b = req.body || {};
  const payload = {};

  // Core
  if (b.title !== undefined) payload.title = String(b.title).trim();
  if (b.description !== undefined)
    payload.description = String(b.description).trim();
  payload.deal = enumValue(b.deal, DEALS);
  payload.type = enumValue(b.type, PROPERTY_TYPES);
  payload.propertyCategory = enumValue(b.propertyCategory, PROPERTY_CATEGORIES);
  payload.price = parseOptionalNumber(b.price);

  // SEO / slug
  if (b.slug !== undefined && String(b.slug).trim())
    payload.slug = String(b.slug).trim();
  if (b.seoTitle !== undefined) payload.seoTitle = String(b.seoTitle).trim();
  if (b.seoDescription !== undefined)
    payload.seoDescription = String(b.seoDescription).trim();

  // Project linkage
  if (b.projectId !== undefined && String(b.projectId).trim()) {
    payload.projectId = mongoose.Types.ObjectId.isValid(String(b.projectId))
      ? String(b.projectId)
      : null;
  }

  // Area (incl. carpet + super built-up)
  const area = parseMaybeJson(b.area);
  if (area && typeof area === "object") {
    payload.area = {
      ...area,
      value: parseOptionalNumber(area.value),
      unit: enumValue(area.unit, AREA_UNITS),
      carpetArea: area.carpetArea
        ? {
            value: parseOptionalNumber(area.carpetArea.value),
            unit: enumValue(area.carpetArea.unit, AREA_UNITS),
          }
        : undefined,
      superBuiltUpArea: area.superBuiltUpArea
        ? {
            value: parseOptionalNumber(area.superBuiltUpArea.value),
            unit: enumValue(area.superBuiltUpArea.unit, AREA_UNITS),
          }
        : undefined,
    };
  }

  // Availability & construction
  payload.availability = enumValue(b.availability, AVAILABILITY);
  const constructionStatus = parseMaybeJson(b.constructionStatus);
  if (constructionStatus && typeof constructionStatus === "object") {
    payload.constructionStatus = {
      percentageComplete: parseOptionalNumber(
        constructionStatus.percentageComplete,
      ),
      currentPhase: constructionStatus.currentPhase
        ? String(constructionStatus.currentPhase).trim()
        : undefined,
      expectedOCDate: parseOptionalDate(constructionStatus.expectedOCDate),
    };
  }
  payload.availableFrom = parseOptionalDate(b.availableFrom);
  payload.possessionDate = parseOptionalDate(b.possessionDate);

  // Preferences
  payload.furnishing = enumValue(b.furnishing, FURNISHING);
  if (b.facing !== undefined) payload.facing = String(b.facing).trim();
  payload.tenantPreference = enumValue(b.tenantPreference, TENANT_PREFERENCES);
  payload.tags = toStringArray(b.tags);
  payload.amenities = toStringArray(b.amenities);
  payload.commercialPropertyTypes = toStringArray(b.commercialPropertyTypes);
  payload.investmentOptions = toStringArray(b.investmentOptions);

  // Pricing terms
  payload.maintenanceCharge = parseOptionalNumber(b.maintenanceCharge);
  payload.securityDeposit = parseOptionalNumber(b.securityDeposit);
  payload.lockInMonths = parseOptionalNumber(b.lockInMonths);
  payload.noticePeriodDays = parseOptionalNumber(b.noticePeriodDays);
  payload.pricePerSqft = parseOptionalNumber(b.pricePerSqft);
  const negotiable = coerceBool(b.negotiable);
  if (negotiable !== undefined) payload.negotiable = negotiable;
  payload.ageOfProperty = parseOptionalNumber(b.ageOfProperty);
  payload.floor = parseOptionalNumber(b.floor);

  // Project / builder info
  if (b.projectName !== undefined)
    payload.projectName = String(b.projectName).trim();
  if (b.builderName !== undefined)
    payload.builderName = String(b.builderName).trim();
  payload.totalUnits = parseOptionalNumber(b.totalUnits);

  // Contact
  payload.contactNumber = toStringArray(b.contactNumber);
  payload.preferredContact = enumValue(b.preferredContact, PREFERRED_CONTACT);
  payload.postedBy = enumValue(b.postedBy, POSTED_BY);

  // Location
  const location = normalizeLocation(b.location);
  if (location) payload.location = location;

  // Ownership / approvals
  payload.ownershipType = enumValue(b.ownershipType, OWNERSHIP_TYPES);
  if (b.approvedBy !== undefined)
    payload.approvedBy = String(b.approvedBy).trim();
  if (b.reraNumber !== undefined)
    payload.reraNumber = String(b.reraNumber).trim();
  payload.ocStatus = enumValue(b.ocStatus, OC_STATUS);

  // Listing lifecycle
  payload.listingAvailability = enumValue(b.listingAvailability, LISTING_AVAIL);

  // Verification / admin flags (admin-only endpoint → allowed)
  for (const flag of [
    "bulbulVerified",
    "ownerVerified",
    "visitVerified",
    "isFeatured",
    "isVerified",
    "isActive",
  ]) {
    const val = coerceBool(b[flag]);
    if (val !== undefined) payload[flag] = val;
  }
  payload.featuredUntil = parseOptionalDate(b.featuredUntil);
  if (b.adminNotes !== undefined)
    payload.adminNotes = String(b.adminNotes).trim();

  // Media
  if (b.virtualTourUrl !== undefined)
    payload.virtualTourUrl = String(b.virtualTourUrl).trim();
  if (b.videoUrl !== undefined) payload.videoUrl = String(b.videoUrl).trim();
  payload.floorPlanImages = toStringArray(b.floorPlanImages);

  // Facilities
  const facilities = parseMaybeJson(b.facilities);
  if (facilities && typeof facilities === "object") {
    payload.facilities = {
      bedrooms: parseOptionalNumber(facilities.bedrooms),
      servantRooms: parseOptionalNumber(facilities.servantRooms),
      bathrooms: parseOptionalNumber(facilities.bathrooms),
      parkings: parseOptionalNumber(facilities.parkings),
      balconies: parseOptionalNumber(facilities.balconies),
      parkingType: enumValue(facilities.parkingType, PARKING_TYPES),
      waterSupply: enumValue(facilities.waterSupply, WATER_SUPPLY),
      powerBackup: coerceBool(facilities.powerBackup),
      totalFloors: parseOptionalNumber(facilities.totalFloors),
      securityFeatures: toStringArray(facilities.securityFeatures)?.filter(
        (x) => SECURITY_FEATURES.includes(x),
      ),
    };
  }

  // Nearby places
  const nearbyPlaces = parseMaybeJson(b.nearbyPlaces);
  if (nearbyPlaces && typeof nearbyPlaces === "object") {
    payload.nearbyPlaces = {
      schools: toStringArray(nearbyPlaces.schools) || [],
      hospitals: toStringArray(nearbyPlaces.hospitals) || [],
      metroStations: toStringArray(nearbyPlaces.metroStations) || [],
      malls: toStringArray(nearbyPlaces.malls) || [],
    };
  }

  return payload;
}

// ── Create ──────────────────────────────────────────────────────────────────
// @desc    Admin: create a property with ANY field from the Property model
// @route   POST /api/admin/properties
// @access  Private (Admin only)
export const adminCreateProperty = asyncHandler(async (req, res) => {
  const payload = extractPropertyPayload(req);

  // Required-field guard (mirrors the model requirements)
  const missing = ["title", "description", "deal", "type"].filter(
    (f) => !payload[f],
  );
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing required field(s): ${missing.join(", ")}`);
  }
  if (payload.price === undefined) {
    res.status(400);
    throw new Error("Missing required field: price");
  }
  if (!payload.location?.address) {
    res.status(400);
    throw new Error("Missing required field: location.address");
  }

  // Owner: allow admin to assign the listing to another user, else self
  let ownerId = req.user._id;
  if (req.body.user && mongoose.Types.ObjectId.isValid(String(req.body.user))) {
    const owner = await User.findById(String(req.body.user)).select("_id");
    if (owner) ownerId = owner._id;
  }

  const { images, floorPlans } = getUploadedImagesAndFloorPlans(req);
  const floorPlanImages = [...(payload.floorPlanImages || []), ...floorPlans];

  const property = new Property({
    ...payload,
    floorPlanImages,
    image: images,
    user: ownerId,
  });

  const createdProperty = await property.save();

  // Link to owner's ownedProperties (best effort)
  try {
    await User.findByIdAndUpdate(ownerId, {
      $addToSet: { ownedProperties: createdProperty._id },
    });
  } catch (e) {
    console.error("Failed to update ownedProperties for user", e);
  }

  res.status(201).json(createdProperty);
});

// ── Update ──────────────────────────────────────────────────────────────────
// @desc    Admin: update a property — every model field can be changed
// @route   PUT /api/admin/properties/:id
// @access  Private (Admin only)
export const adminUpdateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const payload = extractPropertyPayload(req);

  // Merge every provided scalar/nested field
  for (const [key, value] of Object.entries(payload)) {
    if (key === "image" || key === "floorPlanImages") continue;
    if (value !== undefined) property[key] = value;
  }

  // Images: "existingImages" (kept URLs) + newly uploaded files.
  // Strings inside `image` are treated as existing URLs.
  const { images, floorPlans } = getUploadedImagesAndFloorPlans(req);
  const imageInput = parseMaybeJson(req.body.image);
  const existingImages = Array.isArray(imageInput)
    ? imageInput.filter((x) => typeof x === "string")
    : toStringArray(req.body.existingImages) || null;

  if (existingImages !== null || images.length > 0) {
    property.image = [...(existingImages || []), ...images];
  }

  // Floor plans: kept URLs + newly uploaded files
  const keptFloorPlans = payload.floorPlanImages;
  if (keptFloorPlans !== undefined || floorPlans.length > 0) {
    property.floorPlanImages = [...(keptFloorPlans || []), ...floorPlans];
  }

  // Owner reassignment
  if (
    req.body.user &&
    mongoose.Types.ObjectId.isValid(String(req.body.user))
  ) {
    const owner = await User.findById(String(req.body.user)).select("_id");
    if (owner) property.user = owner._id;
  }

  const updatedProperty = await property.save();
  res.json(updatedProperty);
});



