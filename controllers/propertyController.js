import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import VisitReview from "../models/VisitReview.js";

import axios from "axios";
import {
  buildPropertyFindQuery,
  transformPropertyCoordinates,
  escapeRegex,
} from "../utils/propertyFilter.js";

const PDF_SERVICE_URL =
  process.env.PDF_SERVICE_URL || "https://real-estate-pdf-service.onrender.com";

function parseMaybeJson(value) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const LISTING_AVAIL = ["Available", "Fresh", "Under offer", "Booked"];
const OC_STATUS = ["Available", "Applied", "Not issued", "NA"];

function parseOptionalNumber(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
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

function coerceBool(v) {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return undefined;
}

/**
 * @desc    Generate and stream property brochure PDF
 * @route   GET /api/properties/:id/download-brochure
 * @access  Public
 */
export const getPropertyBrochure = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findById(id).populate("user").lean();

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const propertyForPDF = {
    ...property,
    image: property.image?.slice(0, 5) || [],
  };

  // Use native fetch instead of axios — no arraybuffer conversion issues
  const response = await fetch(`${PDF_SERVICE_URL}/generate-brochure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ property: propertyForPDF }),
    signal: AbortSignal.timeout(240000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PDF service error:", errorText);
    res.status(500);
    throw new Error("PDF service failed to generate brochure");
  }

  // Get raw binary as ArrayBuffer then convert to Buffer — no corruption
  const arrayBuffer = await response.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  // Verify it's actually a PDF
  const header = pdfBuffer.slice(0, 5).toString();
  console.log("PDF header:", header); // Should print %PDF-
  if (!header.startsWith("%PDF")) {
    res.status(500);
    throw new Error("Received invalid PDF from service");
  }

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Brochure-${id}.pdf"`,
    "Content-Length": pdfBuffer.length,
    "Cache-Control": "no-cache",
  });

  res.send(pdfBuffer);
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    deal,
    type,
    propertyCategory,
    area,
    availability,
    furnishing,
    facing,
    price,
    postedBy,
    location: rawLocation,
    commercialPropertyTypes,
    investmentOptions,
    facilities,
    listingAvailability,
    virtualTourUrl,
    floorPlanImages: rawFloorPlans,
    nearbyPlaces: rawNearby,
    reraNumber,
    maintenanceCharge,
    securityDeposit,
    lockInMonths,
    noticePeriodDays,
    amenities: rawAmenities,
    ocStatus,
    ageOfProperty,
    pricePerSqft,
    negotiable: rawNegotiable,
    videoUrl,
  } = req.body;

  const images = getUploadedImagesAndFloorPlans(req).images;

  // Log the received data for debugging
  //  console.log("Received property data:", {
  //     title,
  //     description,
  //     deal,
  //     type,
  //     propertyCategory,
  //     area,
  //     availability,
  //     furnishing,
  //     price,
  //     postedBy,
  //     rawLocation,
  //     commercialPropertyTypes,
  //     investmentOptions,
  //     facilities,
  //     imagesCount: images.length,
  //     user: req.user?._id
  //   });

  const location =
    typeof rawLocation === "string" ? JSON.parse(rawLocation) : rawLocation;

  if (location && location.coordinates && location.coordinates.lat) {
    location.coordinates = {
      type: "Point",
      coordinates: [location.coordinates.lng, location.coordinates.lat],
    };
  }

  const uploadedFloorPlans = getUploadedImagesAndFloorPlans(req).floorPlans;
  const floorPlanParsed = parseMaybeJson(rawFloorPlans);
  const floorPlanFromBody = Array.isArray(floorPlanParsed)
    ? floorPlanParsed.filter((x) => typeof x === "string")
    : [];
  const floorPlanImages = [...floorPlanFromBody, ...uploadedFloorPlans];
  const nearbyParsed = parseMaybeJson(rawNearby);
  const amenitiesParsed = parseMaybeJson(rawAmenities);
  const amenities =
    Array.isArray(amenitiesParsed)
      ? amenitiesParsed.filter((x) => typeof x === "string")
      : undefined;
  const negotiableVal = coerceBool(rawNegotiable);

  const property = new Property({
    title,
    description,
    deal,
    type,
    propertyCategory,
    area: typeof area === "string" ? JSON.parse(area) : area,
    availability,
    furnishing,
    facing,
    price,
    postedBy,
    location,
    commercialPropertyTypes,
    investmentOptions,
    image: images,
    facilities:
      typeof facilities === "string" ? JSON.parse(facilities) : facilities,
    user: req.user._id,
    listingAvailability:
      listingAvailability && LISTING_AVAIL.includes(listingAvailability)
        ? listingAvailability
        : "Available",
    virtualTourUrl: virtualTourUrl || undefined,
    floorPlanImages,
    nearbyPlaces:
      nearbyParsed && typeof nearbyParsed === "object"
        ? nearbyParsed
        : undefined,
    reraNumber:
      reraNumber != null && String(reraNumber).trim()
        ? String(reraNumber).trim()
        : undefined,
    maintenanceCharge: parseOptionalNumber(maintenanceCharge),
    securityDeposit: parseOptionalNumber(securityDeposit),
    lockInMonths: parseOptionalNumber(lockInMonths),
    noticePeriodDays: parseOptionalNumber(noticePeriodDays),
    amenities,
    ocStatus:
      ocStatus && OC_STATUS.includes(String(ocStatus))
        ? String(ocStatus)
        : undefined,
    ageOfProperty: parseOptionalNumber(ageOfProperty),
    pricePerSqft: parseOptionalNumber(pricePerSqft),
    negotiable: negotiableVal !== undefined ? negotiableVal : true,
    videoUrl:
      videoUrl != null && String(videoUrl).trim()
        ? String(videoUrl).trim()
        : undefined,
  });

  const createdProperty = await property.save();

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { ownedProperties: createdProperty._id } },
      { new: true },
    );
  } catch (e) {
    console.error("Failed to update ownedProperties for user", e);
  }

  res.status(201).json(createdProperty);
});

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const query = buildPropertyFindQuery(req.query);

  const properties = await Property.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });

  const transformedProperties = properties.map((property) => {
    const propertyObj = property.toObject();
    return transformPropertyCoordinates(propertyObj);
  });

  res.json(transformedProperties);
});

const getCompareProperties = asyncHandler(async (req, res) => {
  const raw = req.query.ids;
  if (!raw) {
    return res.status(400).json({ message: "ids query required" });
  }
  const ids = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .slice(0, 5);

  if (!ids.length) {
    return res.status(400).json({ message: "No valid ids" });
  }

  const properties = await Property.find({
    _id: { $in: ids },
    isActive: true,
    deletedAt: null,
  }).populate("user", "name email phone");

  const map = new Map(
    properties.map((p) => [p._id.toString(), transformPropertyCoordinates(p.toObject())]),
  );
  const ordered = ids.map((id) => map.get(id)).filter(Boolean);
  res.json(ordered);
});

const getSimilarProperties = asyncHandler(async (req, res) => {
  const propertyId = req.query.propertyId;
  const limit = Math.min(Number(req.query.limit) || 8, 20);

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ message: "propertyId required" });
  }

  const property = await Property.findOne({
    _id: propertyId,
    isActive: true,
    deletedAt: null,
  }).lean();

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const city = property.location?.city;
  const bedrooms = property.facilities?.bedrooms;
  const price = property.price || 0;
  const low = Math.max(0, Math.floor(price * 0.85));
  const high = Math.ceil(price * 1.15);

  const query = {
    isActive: true,
    deletedAt: null,
    _id: { $ne: property._id },
    price: { $gte: low, $lte: high },
  };

  if (city) {
    query["location.city"] = {
      $regex: `^${escapeRegex(city)}$`,
      $options: "i",
    };
  }
  if (bedrooms != null && Number(bedrooms) > 0) {
    query["facilities.bedrooms"] = Number(bedrooms);
  }

  const list = await Property.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const transformed = list.map((p) => transformPropertyCoordinates({ ...p }));
  res.json(transformed);
});

const recordPropertyView = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(204).send();
  }

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid property id" });
  }

  const exists = await Property.exists({
    _id: id,
    isActive: true,
    deletedAt: null,
  });
  if (!exists) {
    return res.status(404).json({ message: "Property not found" });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { recentlyViewedProperties: id },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      recentlyViewedProperties: {
        $each: [id],
        $position: 0,
        $slice: 30,
      },
    },
  });

  res.json({ success: true });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findOne({
    _id: req.params.id,
    isActive: true,
    deletedAt: null,
  }).populate("user", "name email phone");

  if (property) {
    const propertyObj = transformPropertyCoordinates(property.toObject());
    res.json(propertyObj);
  } else {
    res.status(404);
    throw new Error("Property not found");
  }
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = property.user.toString() === req.user._id.toString();
  if (!isOwner && !isAdmin) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const {
    title,
    description,
    deal,
    type,
    propertyCategory,
    area,
    availability,
    furnishing,
    facing,
    price,
    postedBy,
    location: rawLocation,
    commercialPropertyTypes,
    investmentOptions,
    facilities,
    existingImages,
    isActive,
    listingAvailability,
    virtualTourUrl,
    floorPlanImages: rawFloorPlans,
    nearbyPlaces: rawNearby,
    bulbulVerified,
    ownerVerified,
    visitVerified,
    reraNumber: bodyReraNumber,
    maintenanceCharge,
    securityDeposit,
    lockInMonths,
    noticePeriodDays,
    amenities: rawAmenities,
    ocStatus,
    ageOfProperty,
    pricePerSqft,
    negotiable: rawNegotiable,
    videoUrl,
  } = req.body;

  const { images: newImages, floorPlans: newFloorPlans } =
    getUploadedImagesAndFloorPlans(req);
  const images = existingImages
    ? [...JSON.parse(existingImages), ...newImages]
    : property.image;

  property.title = title || property.title;
  property.description = description || property.description;
  property.deal = deal || property.deal;
  property.type = type || property.type;
  property.propertyCategory = propertyCategory || property.propertyCategory;
  property.area =
    (typeof area === "string" ? JSON.parse(area) : area) || property.area;
  property.availability = availability || property.availability;
  property.furnishing = furnishing || property.furnishing;
  property.facing = facing || property.facing;
  property.price = price || property.price;
  property.postedBy = postedBy || property.postedBy;

  const location =
    (typeof rawLocation === "string" ? JSON.parse(rawLocation) : rawLocation) ||
    property.location;
  if (location && location.coordinates && location.coordinates.lat) {
    location.coordinates = {
      type: "Point",
      coordinates: [location.coordinates.lng, location.coordinates.lat],
    };
  }
  property.location = location;

  property.commercialPropertyTypes =
    commercialPropertyTypes || property.commercialPropertyTypes;
  property.investmentOptions = investmentOptions || property.investmentOptions;
  property.facilities =
    (typeof facilities === "string" ? JSON.parse(facilities) : facilities) ||
    property.facilities;
  property.image = images;
  property.isActive = isActive === undefined ? property.isActive : isActive;

  if (listingAvailability && LISTING_AVAIL.includes(listingAvailability)) {
    property.listingAvailability = listingAvailability;
  }
  if (virtualTourUrl !== undefined) {
    property.virtualTourUrl = virtualTourUrl || "";
  }
  const fpParsed = parseMaybeJson(rawFloorPlans);
  if (Array.isArray(fpParsed)) {
    property.floorPlanImages = [
      ...fpParsed.filter((x) => typeof x === "string"),
      ...newFloorPlans,
    ];
  } else if (newFloorPlans.length > 0) {
    property.floorPlanImages = [
      ...(property.floorPlanImages || []).filter((x) => typeof x === "string"),
      ...newFloorPlans,
    ];
  }
  const npParsed = parseMaybeJson(rawNearby);
  if (npParsed && typeof npParsed === "object") {
    property.nearbyPlaces = npParsed;
  }

  if (bodyReraNumber !== undefined) {
    property.reraNumber = bodyReraNumber
      ? String(bodyReraNumber).trim()
      : "";
  }

  if (isAdmin) {
    const bb = coerceBool(bulbulVerified);
    if (bb !== undefined) property.bulbulVerified = bb;
    const ob = coerceBool(ownerVerified);
    if (ob !== undefined) property.ownerVerified = ob;
    const vb = coerceBool(visitVerified);
    if (vb !== undefined) property.visitVerified = vb;
  }

  if (maintenanceCharge !== undefined && maintenanceCharge !== "") {
    const m = parseOptionalNumber(maintenanceCharge);
    if (m !== undefined) property.maintenanceCharge = m;
  }
  if (securityDeposit !== undefined && securityDeposit !== "") {
    const s = parseOptionalNumber(securityDeposit);
    if (s !== undefined) property.securityDeposit = s;
  }
  if (lockInMonths !== undefined && lockInMonths !== "") {
    const l = parseOptionalNumber(lockInMonths);
    if (l !== undefined) property.lockInMonths = l;
  }
  if (noticePeriodDays !== undefined && noticePeriodDays !== "") {
    const n = parseOptionalNumber(noticePeriodDays);
    if (n !== undefined) property.noticePeriodDays = n;
  }
  if (ageOfProperty !== undefined && ageOfProperty !== "") {
    const a = parseOptionalNumber(ageOfProperty);
    if (a !== undefined) property.ageOfProperty = a;
  }
  if (pricePerSqft !== undefined && pricePerSqft !== "") {
    const p = parseOptionalNumber(pricePerSqft);
    if (p !== undefined) property.pricePerSqft = p;
  }
  if (rawNegotiable !== undefined && rawNegotiable !== "") {
    const neg = coerceBool(rawNegotiable);
    if (neg !== undefined) property.negotiable = neg;
  }
  if (ocStatus !== undefined) {
    property.ocStatus =
      ocStatus && OC_STATUS.includes(String(ocStatus))
        ? String(ocStatus)
        : undefined;
  }
  if (rawAmenities !== undefined) {
    const am = parseMaybeJson(rawAmenities);
    property.amenities = Array.isArray(am)
      ? am.filter((x) => typeof x === "string")
      : property.amenities;
  }
  if (videoUrl !== undefined) {
    property.videoUrl = videoUrl ? String(videoUrl).trim() : "";
  }

  const updatedProperty = await property.save();
  res.json(updatedProperty);
});

// @desc    Delete a property + cleanup favorites + cleanup bookings
// @route   DELETE /api/properties/:id
// @access  Private (Admin or Owner)

const deleteProperty = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const property = await Property.findById(req.params.id).session(session);

    if (!property) {
      res.status(404);
      throw new Error("Property not found");
    }

    //const isOwner = property.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      res.status(403);
      throw new Error("Not authorized to delete this property");
    }

    // 1️⃣ Remove property from ALL users' favorites
    await User.updateMany(
      { favProperties: property._id },
      { $pull: { favProperties: property._id } },
      { session },
    );

    // 2️⃣ Find & delete all bookings related to this property
    const bookings = await Booking.find(
      { property: property._id },
      { _id: 1 },
    ).session(session);

    const bookingIds = bookings.map((b) => b._id);

    await Booking.deleteMany({ property: property._id }, { session });

    await VisitReview.deleteMany({ property: property._id }, { session });

    // 3️⃣ Remove deleted bookings from users' bookedVisits
    if (bookingIds.length) {
      await User.updateMany(
        { bookedVisits: { $in: bookingIds } },
        { $pull: { bookedVisits: { $in: bookingIds } } },
        { session },
      );
    }

    // 4️⃣ Remove property from owner's ownedProperties
    await User.findByIdAndUpdate(
      property.user,
      { $pull: { ownedProperties: property._id } },
      { session },
    );

    // 5️⃣ Permanently delete the property
    await Property.findByIdAndDelete(property._id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Property permanently deleted",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// @desc    Get properties owned by authenticated user
// @route   GET /api/properties/owned
// @access  Private
const getOwnedProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    user: req.user._id,
    deletedAt: null,
  }).sort({ createdAt: -1 });
  res.json(properties);
});

// @desc    Create a WhatsApp lead for brochure request
// @route   POST /api/properties/:id/whatsapp-lead
// @access  Private
const createWhatsAppLead = asyncHandler(async (req, res) => {
  const { userName, userPhone } = req.body;
  const propertyId = req.params.id;

  // Validate required fields
  if (!userName || !userPhone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone number are required",
    });
  }

  // Validate phone number format (10 digits)
  if (!/^\d{10}$/.test(userPhone)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid 10-digit phone number",
    });
  }

  // Check if property exists and is active
  const property = await Property.findById(propertyId);
  if (!property || !property.isActive || property.deletedAt) {
    return res.status(404).json({
      success: false,
      message: "Property not found or no longer available",
    });
  }

  // Get broker information (property owner)
  const broker = await User.findById(property.user);
  if (!broker) {
    return res.status(404).json({
      success: false,
      message: "Broker information not found",
    });
  }

  // Generate brochure URL
  const brochureUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/properties/${propertyId}/download-brochure`;

  // Create lead record
  const lead = new Lead({
    propertyId,
    brokerId: property.user,
    userName,
    userPhone,
    type: "BROCHURE_REQUEST",
    status: "PENDING",
    brochureUrl,
    source: "WHATSAPP",
    notes: `Lead generated via WhatsApp sharing for property: ${property.title}`,
  });

  const createdLead = await lead.save();

  // Log the lead creation for now (can be extended to send notifications)
  console.log(
    `New WhatsApp lead created: ${userName} for property ${property.title} (${propertyId})`,
  );

  // Return success response with brochure URL
  res.status(201).json({
    success: true,
    message: "Lead created successfully. Opening WhatsApp chat with broker...",
    data: {
      leadId: createdLead._id,
      brochureUrl,
      brokerPhone: broker.contactNumber?.[0] || broker.phone,
      brokerName: broker.name,
    },
  });
});

export {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOwnedProperties,
  createWhatsAppLead,
  getCompareProperties,
  getSimilarProperties,
  recordPropertyView,
};
