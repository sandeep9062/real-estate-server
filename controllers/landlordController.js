import User from "../models/User.js";
import Landlord from "../models/Landlord.js";

/**
 * @desc    Register a new landlord
 * @route   POST /api/landlords/register
 * @access  Public
 */
export const registerLandlord = async (req, res) => {
  try {
    let {
      name,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      pincode,
      bio,
      locations,
      languages,
      propertyTypes,
      isCompany,
      companyName,
      gstin,
      pan,
      userId,
    } = req.body;

    // Parse JSON-stringified arrays (sent via FormData from frontend)
    if (typeof locations === "string") {
      try {
        locations = JSON.parse(locations);
      } catch {
        locations = [locations];
      }
    }
    if (typeof languages === "string") {
      try {
        languages = JSON.parse(languages);
      } catch {
        languages = [languages];
      }
    }
    if (typeof propertyTypes === "string") {
      try {
        propertyTypes = JSON.parse(propertyTypes);
      } catch {
        propertyTypes = [propertyTypes];
      }
    }

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required.",
      });
    }

    // Check if a landlord with this phone already exists
    const existingLandlordByPhone = await Landlord.findOne({ phone });
    if (existingLandlordByPhone) {
      return res.status(409).json({
        success: false,
        message:
          "A landlord with this phone number is already registered. Please log in instead.",
      });
    }

    let user;

    // If userId is provided, use the existing user; otherwise create a new one
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User account not found.",
        });
      }
      // Promote the user to landlord role if they aren't already
      if (user.role !== "landlord") {
        user.role = "landlord";
        await user.save();
      }
    } else {
      // Check if user with this email already exists (only for new users)
      if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message:
              "An account with this email already exists. Please log in instead.",
          });
        }
      }
      // Create a user record first
      user = await User.create({
        name,
        email: email || `${phone}@landlord.propertybulbul.com`,
        phone,
        role: "landlord",
        isActive: true,
      });
    }

    // Create the landlord record
    const landlord = await Landlord.create({
      userID: user._id,
      name,
      phone,
      whatsapp: whatsapp || phone,
      email: email || "",
      address,
      city,
      state,
      pincode,
      bio,
      locations: locations || [],
      languages: languages || [],
      propertyTypes: propertyTypes || [],
      isCompany: isCompany === "true" || isCompany === true,
      companyName: companyName || "",
      gstin: gstin || "",
      pan: pan || "",
      status: "active",
      isVerified: false,
      memberSince: new Date(),
    });

    // Upload profile photo if provided
    if (req.file) {
      landlord.avatar = req.file.path;
      await landlord.save();
    }

    res.status(201).json({
      success: true,
      message: "Landlord profile created successfully.",
      data: {
        id: landlord._id,
        name: landlord.name,
        slug: landlord.slug,
      },
    });
  } catch (error) {
    console.error("Landlord registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A landlord with this information already exists. Please contact support.",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

/**
 * @desc    Get all landlords
 * @route   GET /api/landlords
 * @access  Public
 */
export const getLandlords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      city,
      isVerified,
      featured,
      search,
    } = req.query;

    const query = {};

    // Filters
    if (status) query.status = status;
    if (city) query.city = { $regex: city, $options: "i" };
    if (isVerified !== undefined) query.isVerified = isVerified === "true";
    if (featured !== undefined) query.featured = featured === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Landlord.countDocuments(query);
    const landlords = await Landlord.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: landlords.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: landlords,
    });
  } catch (error) {
    console.error("Get landlords error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch landlords.",
    });
  }
};

/**
 * @desc    Get a single landlord by ID or slug
 * @route   GET /api/landlords/:identifier
 * @access  Public
 */
export const getLandlordById = async (req, res) => {
  try {
    const { identifier } = req.params;

    let landlord;

    // Check if identifier is a valid ObjectId (MongoDB ID)
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

    if (isObjectId) {
      landlord = await Landlord.findById(identifier);
    } else {
      landlord = await Landlord.findOne({ slug: identifier });
    }

    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: landlord,
    });
  } catch (error) {
    console.error("Get landlord error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch landlord.",
    });
  }
};

/**
 * @desc    Update a landlord profile
 * @route   PUT /api/landlords/:id
 * @access  Private
 */
export const updateLandlord = async (req, res) => {
  try {
    const { id } = req.params;

    let landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    // Fields that are allowed to be updated
    const allowedUpdates = [
      "name",
      "title",
      "bio",
      "longBio",
      "phone",
      "whatsapp",
      "email",
      "address",
      "city",
      "state",
      "pincode",
      "avatarColor",
      "coverImage",
      "totalProperties",
      "activeListings",
      "propertyTypes",
      "isCompany",
      "companyName",
      "gstin",
      "pan",
      "locations",
      "languages",
      "preferences",
      "metaTitle",
      "metaDescription",
    ];

    // Update only allowed fields from request body
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        // Parse JSON-stringified arrays
        if (
          Array.isArray(landlord[field]) &&
          typeof req.body[field] === "string"
        ) {
          try {
            landlord[field] = JSON.parse(req.body[field]);
          } catch {
            landlord[field] = req.body[field];
          }
        } else {
          landlord[field] = req.body[field];
        }
      }
    }

    // Upload profile photo if provided
    if (req.file) {
      landlord.avatar = req.file.path;
    }

    await landlord.save();

    res.status(200).json({
      success: true,
      message: "Landlord profile updated successfully.",
      data: landlord,
    });
  } catch (error) {
    console.error("Update landlord error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A landlord with this slug already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update landlord.",
    });
  }
};

/**
 * @desc    Delete a landlord
 * @route   DELETE /api/landlords/:id
 * @access  Private/Admin
 */
export const deleteLandlord = async (req, res) => {
  try {
    const { id } = req.params;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    // Optionally delete the associated user as well
    if (landlord.userID) {
      await User.findByIdAndUpdate(landlord.userID, { role: "user" });
    }

    await Landlord.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Landlord deleted successfully.",
    });
  } catch (error) {
    console.error("Delete landlord error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete landlord.",
    });
  }
};

/**
 * @desc    Upload a document for a landlord
 * @route   POST /api/landlords/:id/documents
 * @access  Private
 */
export const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type } = req.body;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required.",
      });
    }

    landlord.documents.push({
      title: title || "",
      type: type || "other",
      url: req.file.path,
      verified: false,
      uploadedAt: new Date(),
    });

    await landlord.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      data: landlord.documents,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document.",
    });
  }
};

/**
 * @desc    Verify a landlord document (admin)
 * @route   PATCH /api/landlords/:id/documents/:docId/verify
 * @access  Private/Admin
 */
export const verifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    const document = landlord.documents.id(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    document.verified = true;
    await landlord.save();

    res.status(200).json({
      success: true,
      message: "Document verified successfully.",
      data: landlord,
    });
  } catch (error) {
    console.error("Document verify error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify document.",
    });
  }
};

/**
 * @desc    Update landlord verification status (admin)
 * @route   PATCH /api/landlords/:id/verify
 * @access  Private/Admin
 */
export const verifyLandlord = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, identityVerified } = req.body;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    if (isVerified !== undefined) landlord.isVerified = isVerified;
    if (identityVerified !== undefined)
      landlord.identityVerified = identityVerified;

    await landlord.save();

    res.status(200).json({
      success: true,
      message: `Landlord ${landlord.isVerified ? "verified" : "unverified"} successfully.`,
      data: landlord,
    });
  } catch (error) {
    console.error("Verify landlord error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update verification status.",
    });
  }
};

/**
 * @desc    Update bank details for a landlord
 * @route   PUT /api/landlords/:id/bank-details
 * @access  Private
 */
export const updateBankDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } =
      req.body;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    landlord.bankDetails = {
      accountHolderName:
        accountHolderName || landlord.bankDetails?.accountHolderName,
      accountNumber: accountNumber || landlord.bankDetails?.accountNumber,
      ifscCode: ifscCode || landlord.bankDetails?.ifscCode,
      bankName: bankName || landlord.bankDetails?.bankName,
      upiId: upiId || landlord.bankDetails?.upiId,
    };

    await landlord.save();

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully.",
      data: landlord,
    });
  } catch (error) {
    console.error("Update bank details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bank details.",
    });
  }
};

/**
 * @desc    Toggle featured status for a landlord (admin)
 * @route   PATCH /api/landlords/:id/featured
 * @access  Private/Admin
 */
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    landlord.featured = !landlord.featured;
    await landlord.save();

    res.status(200).json({
      success: true,
      message: `Landlord ${landlord.featured ? "featured" : "unfeatured"} successfully.`,
      data: landlord,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status.",
    });
  }
};

/**
 * @desc    Update landlord status (admin)
 * @route   PATCH /api/landlords/:id/status
 * @access  Private/Admin
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Must be one of: active, inactive, suspended.",
      });
    }

    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: "Landlord not found.",
      });
    }

    landlord.status = status;
    await landlord.save();

    res.status(200).json({
      success: true,
      message: `Landlord status updated to "${status}".`,
      data: landlord,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status.",
    });
  }
};
