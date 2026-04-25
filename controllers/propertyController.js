import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

import axios from "axios";

const PDF_SERVICE_URL =
  process.env.PDF_SERVICE_URL || "https://real-estate-pdf-service.onrender.com";

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
    image: property.image?.slice(0, 3) || [],
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
  } = req.body;

  const images = req.files ? req.files.map((file) => file.path) : [];

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
  // console.log(req.query);
  const {
    search,
    deal,
    type,
    priceMin,
    priceMax,
    areaMin,
    availability,
    areaMax,
    furnishing,
    postedBy,
    propertyCategory,
    bedrooms,
    city,
  } = req.query;
  const query = { isActive: true, deletedAt: null };

  if (search) {
    query.$or = [
      { "location.state": { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } }, //change
      { description: { $regex: search, $options: "i" } }, //change
      { title: { $regex: search, $options: "i" } },
    ];
  }

  if (city) {
    query["location.city"] = { $regex: `^${city}$`, $options: "i" };
  }

  if (availability) query.availability = availability;
  if (deal) query.deal = deal;
  if (type) query.type = type;
  if (furnishing) query.furnishing = furnishing;
  if (postedBy) query.postedBy = postedBy;
  if (propertyCategory) query.propertyCategory = propertyCategory;
  if (bedrooms) {
    if (bedrooms === "5+") {
      query["facilities.bedrooms"] = { $gte: 5 };
    } else {
      query["facilities.bedrooms"] = Number(bedrooms);
    }
  }
  if (req.query.projectId) {
    query.projectId = req.query.projectId;
  }
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (areaMin || areaMax) {
    query["area.value"] = {};
    if (areaMin) query["area.value"].$gte = Number(areaMin);
    if (areaMax) query["area.value"].$lte = Number(areaMax);
  }

  const properties = await Property.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
  // sort to get latest listed properties at top
  const transformedProperties = properties.map((property) => {
    const propertyObj = property.toObject();
    if (
      propertyObj.location &&
      propertyObj.location.coordinates &&
      propertyObj.location.coordinates.coordinates
    ) {
      const [lng, lat] = propertyObj.location.coordinates.coordinates;
      propertyObj.location.coordinates = { lat, lng };
    }
    return propertyObj;
  });

  res.json(transformedProperties);
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
    const propertyObj = property.toObject();
    if (
      propertyObj.location &&
      propertyObj.location.coordinates &&
      propertyObj.location.coordinates.coordinates
    ) {
      const [lng, lat] = propertyObj.location.coordinates.coordinates;
      propertyObj.location.coordinates = { lat, lng };
    }
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

  if (property.user.toString() !== req.user._id.toString()) {
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
  } = req.body;

  const newImages = req.files ? req.files.map((file) => file.path) : [];
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
};
