import Roommate from "../models/Roommate.js";

/**
 * @desc    Create a new roommate listing
 * @route   POST /api/roommates
 * @access  Private
 */
export const createRoommate = async (req, res) => {
  try {
    const {
      searchType,
      propertyID,
      name,
      gender,
      bio,
      approxBudget,
      moveInDate,
      preferredLocations,
      cities,
      lifestyle,
      roomDetails,
      phone,
      whatsapp,
      avatar,
      avatarColor,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate required fields
    if (!name || !gender || !searchType) {
      return res.status(400).json({
        success: false,
        message: "Name, gender, and search type are required.",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to create a roommate listing.",
      });
    }

    const roommate = await Roommate.create({
      userID: req.user._id,
      searchType,
      propertyID: propertyID || null,
      name,
      gender,
      bio,
      approxBudget: approxBudget || 0,
      moveInDate: moveInDate || Date.now(),
      preferredLocations: preferredLocations || [],
      cities: cities || [],
      lifestyle: lifestyle || {},
      roomDetails: roomDetails || {},
      phone,
      whatsapp,
      avatar,
      avatarColor: avatarColor || "#4161df",
      metaTitle,
      metaDescription,
    });

    res.status(201).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error creating roommate listing:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating roommate listing.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all roommate listings with filtering & pagination
 * @route   GET /api/roommates
 * @access  Public
 */
export const getRoommates = async (req, res) => {
  try {
    const {
      searchType,
      gender,
      genderPreference,
      profession,
      dietary,
      smoking,
      drinking,
      petsFriendly,
      routine,
      city,
      minBudget,
      maxBudget,
      status,
      verified,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter query
    const filter = {};

    if (searchType) filter.searchType = searchType;
    if (gender) filter.gender = gender;
    if (status) filter.status = status;
    if (verified !== undefined) filter.verified = verified === "true";

    // Lifestyle filters
    if (genderPreference)
      filter["lifestyle.genderPreference"] = genderPreference;
    if (profession) filter["lifestyle.profession"] = profession;
    if (dietary) filter["lifestyle.dietary"] = dietary;
    if (smoking !== undefined) filter["lifestyle.smoking"] = smoking === "true";
    if (drinking !== undefined)
      filter["lifestyle.drinking"] = drinking === "true";
    if (petsFriendly !== undefined)
      filter["lifestyle.petsFriendly"] = petsFriendly === "true";
    if (routine) filter["lifestyle.routine"] = routine;

    // City filter
    if (city) filter.cities = { $in: [city] };

    // Budget range filter
    if (minBudget || maxBudget) {
      filter.approxBudget = {};
      if (minBudget) filter.approxBudget.$gte = Number(minBudget);
      if (maxBudget) filter.approxBudget.$lte = Number(maxBudget);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "budget_asc") sortOption = { approxBudget: 1 };
    else if (sort === "budget_desc") sortOption = { approxBudget: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "move_in") sortOption = { moveInDate: 1 };

    const [roommates, total] = await Promise.all([
      Roommate.find(filter)
        .populate("userID", "name email phone")
        .populate("propertyID", "title slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Roommate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: roommates.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: roommates,
    });
  } catch (error) {
    console.error("Error fetching roommate listings:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching roommate listings.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single roommate listing by ID
 * @route   GET /api/roommates/:id
 * @access  Public
 */
export const getRoommateById = async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id)
      .populate("userID", "name email phone")
      .populate("propertyID", "title slug");

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error fetching roommate listing:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching roommate listing.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single roommate listing by slug
 * @route   GET /api/roommates/slug/:slug
 * @access  Public
 */
export const getRoommateBySlug = async (req, res) => {
  try {
    const roommate = await Roommate.findOne({ slug: req.params.slug })
      .populate("userID", "name email phone")
      .populate("propertyID", "title slug");

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error fetching roommate listing by slug:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching roommate listing.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a roommate listing
 * @route   PUT /api/roommates/:id
 * @access  Private (Owner or Admin)
 */
export const updateRoommate = async (req, res) => {
  try {
    let roommate = await Roommate.findById(req.params.id);

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    // Ensure the user owns this listing or is admin
    const isOwner = roommate.userID.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing.",
      });
    }

    const allowedFields = [
      "searchType",
      "propertyID",
      "name",
      "gender",
      "bio",
      "approxBudget",
      "moveInDate",
      "preferredLocations",
      "cities",
      "lifestyle",
      "roomDetails",
      "phone",
      "whatsapp",
      "avatar",
      "avatarColor",
      "metaTitle",
      "metaDescription",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    roommate = await Roommate.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error updating roommate listing:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating roommate listing.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a roommate listing
 * @route   DELETE /api/roommates/:id
 * @access  Private (Owner or Admin)
 */
export const deleteRoommate = async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    // Ensure the user owns this listing or is admin
    const isOwner = roommate.userID.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing.",
      });
    }

    await Roommate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Roommate listing deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting roommate listing:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting roommate listing.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update roommate listing status (active / found_match / inactive)
 * @route   PATCH /api/roommates/:id/status
 * @access  Private (Owner or Admin)
 */
export const updateRoommateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "found_match", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Valid status is required: "active", "found_match", or "inactive".',
      });
    }

    let roommate = await Roommate.findById(req.params.id);

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    // Ensure the user owns this listing or is admin
    const isOwner = roommate.userID.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing status.",
      });
    }

    roommate.status = status;
    await roommate.save();

    res.status(200).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error updating roommate status:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating roommate status.",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle roommate verified status
 * @route   PATCH /api/roommates/:id/verify
 * @access  Private (Admin only)
 */
export const toggleRoommateVerified = async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);

    if (!roommate) {
      return res.status(404).json({
        success: false,
        message: "Roommate listing not found.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify roommate listings.",
      });
    }

    roommate.verified = !roommate.verified;
    await roommate.save();

    res.status(200).json({
      success: true,
      data: roommate,
    });
  } catch (error) {
    console.error("Error toggling roommate verification:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while toggling verification.",
      error: error.message,
    });
  }
};
