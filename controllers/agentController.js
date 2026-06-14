import User from "../models/User.js";
import Agent from "../models/Agent.js";

/**
 * @desc    Register a new agent (public registration)
 * @route   POST /api/agents/register
 * @access  Public
 */
export const registerAgent = async (req, res) => {
  try {
    let {
      name,
      title,
      phone,
      whatsapp,
      email,
      experience,
      locations,
      specialisations,
      languages,
      bio,
      agencyName,
      reraNumber,
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
    if (typeof specialisations === "string") {
      try {
        specialisations = JSON.parse(specialisations);
      } catch {
        specialisations = [specialisations];
      }
    }
    if (typeof languages === "string") {
      try {
        languages = JSON.parse(languages);
      } catch {
        languages = [languages];
      }
    }

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required.",
      });
    }

    if (!locations || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one area you operate in.",
      });
    }

    if (!specialisations || specialisations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one specialisation.",
      });
    }

    // Check if an agent with this phone already exists
    const existingAgentByPhone = await Agent.findOne({ phone });
    if (existingAgentByPhone) {
      return res.status(409).json({
        success: false,
        message:
          "An agent with this phone number is already registered. Please log in instead.",
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
      // Promote the user to agent role if they aren't already
      if (user.role !== "agent") {
        user.role = "agent";
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
        email: email || `${phone}@agent.propertybulbul.com`,
        phone,
        role: "agent",
        isActive: true,
      });
    }

    // Parse experience string to number of years
    let experienceYears = 0;
    if (experience) {
      const match = experience.match(/(\d+)/);
      if (match) {
        experienceYears = parseInt(match[1], 10);
      } else if (experience.includes("Less than 1")) {
        experienceYears = 0;
      } else if (experience.includes("10+")) {
        experienceYears = 10;
      }
    }

    // Create the agent record
    const agent = await Agent.create({
      userID: user._id,
      name,
      title: title || "",
      phone,
      whatsapp: whatsapp || phone,
      email: email || "",
      experience: experienceYears,
      locations,
      specialisations,
      languages: languages || [],
      bio,
      rera: reraNumber || "",
      agencyName: agencyName || "",
      status: "active",
      verified: false,
    });

    // Upload profile photo if provided
    if (req.file) {
      agent.avatar = req.file.path;
      await agent.save();
    }

    res.status(201).json({
      success: true,
      message:
        "Your application has been received. Our team will review and reach out within 24–48 hours.",
      data: {
        id: agent._id,
        name: agent.name,
      },
    });
  } catch (error) {
    console.error("Agent registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An agent with this information already exists. Please contact support.",
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
