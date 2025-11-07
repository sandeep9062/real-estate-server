import asyncHandler from "express-async-handler";
import Property from "../models/Property.js";
import User from "../models/User.js";

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
    price,
    postedBy,
    location: rawLocation,
    commercialPropertyTypes,
    investmentOptions,
    facilities,
  } = req.body;

  const images = req.files ? req.files.map((file) => file.path) : [];

  if (images.length === 0) {
    res.status(400);
    throw new Error("No images uploaded");
  }

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
      { new: true }
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
  console.log(req.query);
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
      { "location.city": { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
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

  const properties = await Property.find(query).populate("user", "name email");

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
  }).populate("user", "name email");

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
    price,
    postedBy,
    location: rawLocation,
    commercialPropertyTypes,
    investmentOptions,
    facilities,
    isActive,
  } = req.body;

  const images = req.files
    ? req.files.map((file) => file.path)
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

// @desc    Delete a property (soft delete)
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  if (property.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }

  property.deletedAt = new Date();
  property.isActive = false;
  await property.save();

  res.json({ message: "Property removed" });
});

// @desc    Get properties owned by authenticated user
// @route   GET /api/properties/owned
// @access  Private
const getOwnedProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    user: req.user._id,
    deletedAt: null,
  });
  res.json(properties);
});

export {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOwnedProperties,
};
