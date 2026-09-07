import User from "../models/User.js";
import Agent from "../models/Agent.js";
import {
  getProfileCompleteness,
  AGENT_PROFILE_FIELDS,
} from "../utils/profileCompleteness.js";
import { ensureAgentProfile } from "../auth/auth.service.js";

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
      isActive: true,
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

/**
 * @desc    Get an agent profile by the linked User ID
 * @route   GET /api/agents/by-user/:userId
 * @access  Private/Admin (admin dashboard user-profile page)
 */
export const getAgentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const agent = await Agent.findOne({ userID: userId });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "No agent profile found for this user.",
      });
    }

    const agentData = agent.toJSON();
    agentData.profileCompleteness = getProfileCompleteness(
      agentData,
      AGENT_PROFILE_FIELDS,
    );

    res.status(200).json({
      success: true,
      data: agentData,
    });
  } catch (error) {
    console.error("Get agent by user id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent profile.",
    });
  }
};

/**
 * @desc    Get the logged-in agent's own profile (with profileCompleteness)
 * @route   GET /api/agents/me
 * @access  Private
 *
 * Lazily (re-)creates the Agent doc if the user's role is "agent" but the doc
 * is missing (fallback for a select-role failure after the role was saved).
 * Returns 404 if the user isn't an agent (admins without an Agent doc also
 * get 404 — we never auto-create profiles for admins).
 */
export const getMyAgentProfile = async (req, res) => {
  try {
    if (req.user.role !== "agent" && req.user.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "No agent profile found.",
      });
    }

    let agent = await Agent.findOne({ userID: req.user._id });

    if (!agent && req.user.role === "agent") {
      // Lazy fallback: role was saved but the profile doc is missing.
      console.warn(
        `⚠️ Agent doc missing for user ${req.user._id} (role=agent) — creating lazily.`,
      );
      agent = await ensureAgentProfile(req.user);
    }

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "No agent profile found.",
      });
    }

    const agentData = agent.toJSON();
    agentData.profileCompleteness = getProfileCompleteness(
      agentData,
      AGENT_PROFILE_FIELDS,
    );

    res.status(200).json({
      success: true,
      data: agentData,
    });
  } catch (error) {
    console.error("Get my agent profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent profile.",
    });
  }
};

/**
 * @desc    Update the logged-in agent's own profile (partial updates allowed)
 * @route   PUT /api/agents/me
 * @access  Private
 *
 * Accepts JSON or multipart (optional `photo` file for the avatar). Only the
 * fields present in the request body are changed — no full wizard payload
 * required. Unknown/forbidden fields (email, userID, verification, stats...)
 * are ignored. Scoped to the requester via req.user._id.
 */
const AGENT_EDITABLE_STRING_FIELDS = [
  "name",
  "title",
  "phone",
  "whatsapp",
  "agencyName",
  "bio",
  "longBio",
  "rera",
];
const AGENT_EDITABLE_ARRAY_FIELDS = [
  "locations",
  "specialisations",
  "languages",
  "achievements",
];

export const updateMyAgentProfile = async (req, res) => {
  try {
    if (req.user.role !== "agent" && req.user.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "No agent profile found.",
      });
    }

    let agent = await Agent.findOne({ userID: req.user._id });
    if (!agent) {
      if (req.user.role === "agent") {
        console.warn(
          `⚠️ Agent doc missing for user ${req.user._id} (role=agent) — creating lazily on update.`,
        );
        agent = await ensureAgentProfile(req.user);
      } else {
        return res.status(404).json({
          success: false,
          message: "No agent profile found.",
        });
      }
    }

    let updatesApplied = 0;

    // Simple string fields — only set when provided in the body
    for (const field of AGENT_EDITABLE_STRING_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        const value = String(req.body[field]).trim();
        agent[field] = value;
        updatesApplied += 1;
      }
    }

    // Array fields — accept a real array or a JSON-encoded string (FormData)
    for (const field of AGENT_EDITABLE_ARRAY_FIELDS) {
      let value = req.body[field];
      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = [value];
        }
      }
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for "${field}" — expected an array of strings.`,
        });
      }
      agent[field] = value.map((v) => v.trim()).filter(Boolean);
      updatesApplied += 1;
    }

    // Years of experience — self-reported numeric stat (deals / responseTime /
    // responseRate are system-computed and stay non-editable here).
    const experience = req.body.experience;
    if (experience !== undefined && experience !== null && experience !== "") {
      const years = Number(experience);
      if (!Number.isFinite(years) || years < 0 || years > 60) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "experience" — expected a number between 0 and 60.',
        });
      }
      agent.experience = Math.round(years);
      updatesApplied += 1;
    }

    // Optional avatar upload (multipart `photo`), same convention as the wizard
    if (req.file?.path) {
      agent.avatar = req.file.path;
      updatesApplied += 1;
    }

    if (updatesApplied === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable fields were provided.",
      });
    }

    await agent.save();

    const agentData = agent.toJSON();
    agentData.profileCompleteness = getProfileCompleteness(
      agentData,
      AGENT_PROFILE_FIELDS,
    );

    res.status(200).json({
      success: true,
      message: "Agent profile updated.",
      data: agentData,
    });
  } catch (error) {
    console.error("Update my agent profile error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update agent profile.",
    });
  }
};

// Admin-editable fields — superset of the agent's own editable fields, plus
// identity/verification, branding and SEO fields for the admin dashboard.
const AGENT_ADMIN_STRING_FIELDS = [
  ...AGENT_EDITABLE_STRING_FIELDS,
  "email",
  "avatarColor",
  "coverColor",
  "coverImage",
  "metaTitle",
  "metaDescription",
];
const AGENT_ADMIN_BOOLEAN_FIELDS = ["verified", "topAgent", "featured", "isActive"];

/**
 * @desc    Update an agent profile by the linked User ID (admin dashboard)
 * @route   PUT /api/agents/by-user/:userId
 * @access  Private/Admin
 */
export const updateAgentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const agent = await Agent.findOne({ userID: userId });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "No agent profile found for this user.",
      });
    }

    let updatesApplied = 0;

    // Simple string fields — only set when provided in the body
    for (const field of AGENT_ADMIN_STRING_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        agent[field] = String(req.body[field]).trim();
        updatesApplied += 1;
      }
    }

    // Array fields — accept a real array or a JSON-encoded string (FormData)
    for (const field of AGENT_EDITABLE_ARRAY_FIELDS) {
      let value = req.body[field];
      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = [value];
        }
      }
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for "${field}" — expected an array of strings.`,
        });
      }
      agent[field] = value.map((v) => v.trim()).filter(Boolean);
      updatesApplied += 1;
    }

    // Boolean flags (verified / topAgent / featured) — accept real booleans
    // or the strings "true"/"false" so JSON and FormData callers both work.
    for (const field of AGENT_ADMIN_BOOLEAN_FIELDS) {
      if (req.body[field] === undefined || req.body[field] === null) continue;
      const value =
        typeof req.body[field] === "string"
          ? req.body[field] === "true"
          : req.body[field];
      if (typeof value !== "boolean") {
        return res.status(400).json({
          success: false,
          message: `Invalid value for "${field}" — expected a boolean.`,
        });
      }
      agent[field] = value;
      updatesApplied += 1;
    }

    // Years of experience — numeric, same validation as the self-edit route
    const experience = req.body.experience;
    if (experience !== undefined && experience !== null && experience !== "") {
      const years = Number(experience);
      if (!Number.isFinite(years) || years < 0 || years > 60) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "experience" — expected a number between 0 and 60.',
        });
      }
      agent.experience = Math.round(years);
      updatesApplied += 1;
    }

    // Status — enum-validated
    // (removed — profiles use the `isActive` boolean instead of a `status` string)

    // Optional avatar upload (multipart `photo`)
    if (req.file?.path) {
      agent.avatar = req.file.path;
      updatesApplied += 1;
    }

    if (updatesApplied === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable fields were provided.",
      });
    }

    await agent.save();

    const agentData = agent.toJSON();
    agentData.profileCompleteness = getProfileCompleteness(
      agentData,
      AGENT_PROFILE_FIELDS,
    );

    res.status(200).json({
      success: true,
      message: "Agent profile updated.",
      data: agentData,
    });
  } catch (error) {
    console.error("Update agent by user id error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update agent profile.",
    });
  }
};

/**
 * @desc    Create an agent profile for an existing user (admin dashboard)
 * @route   POST /api/agents/by-user/:userId
 * @access  Private/Admin
 */
export const createAgentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // The linked user must exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Only users with the "agent" role can get an agent profile
    if (user.role !== "agent") {
      return res.status(400).json({
        success: false,
        message: `This user's role is "${user.role}" — only users with the "agent" role can have an agent profile.`,
      });
    }

    // One profile per user — reject duplicates
    const existing = await Agent.findOne({ userID: userId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This user already has an agent profile.",
      });
    }

    const agent = new Agent({
      userID: userId,
      // Seed identity fields from the user account when not provided
      name: String(req.body.name || user.name || "").trim(),
      email: String(req.body.email || user.email || "").trim(),
      phone: String(req.body.phone || user.phone || "").trim(),
    });

    if (!agent.name) {
      return res.status(400).json({
        success: false,
        message: '"name" is required to create an agent profile.',
      });
    }

    // String fields (title, whatsapp, agencyName, bio, longBio, rera, email,
    // avatarColor, coverColor, coverImage, metaTitle, metaDescription)
    for (const field of AGENT_ADMIN_STRING_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        agent[field] = String(req.body[field]).trim();
      }
    }

    // Array fields — accept a real array or a JSON-encoded string (FormData)
    for (const field of AGENT_EDITABLE_ARRAY_FIELDS) {
      let value = req.body[field];
      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = [value];
        }
      }
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for "${field}" — expected an array of strings.`,
        });
      }
      agent[field] = value.map((v) => v.trim()).filter(Boolean);
    }

    // Boolean flags (verified / topAgent / featured)
    for (const field of AGENT_ADMIN_BOOLEAN_FIELDS) {
      if (req.body[field] === undefined || req.body[field] === null) continue;
      const value =
        typeof req.body[field] === "string"
          ? req.body[field] === "true"
          : req.body[field];
      if (typeof value !== "boolean") {
        return res.status(400).json({
          success: false,
          message: `Invalid value for "${field}" — expected a boolean.`,
        });
      }
      agent[field] = value;
    }

    // Years of experience
    const experience = req.body.experience;
    if (experience !== undefined && experience !== null && experience !== "") {
      const years = Number(experience);
      if (!Number.isFinite(years) || years < 0 || years > 60) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "experience" — expected a number between 0 and 60.',
        });
      }
      agent.experience = Math.round(years);
    }

    // Status — enum-validated
    // (removed — profiles use the `isActive` boolean instead of a `status` string)

    // Optional avatar upload (multipart `photo`)
    if (req.file?.path) {
      agent.avatar = req.file.path;
    }

    await agent.save();

    const agentData = agent.toJSON();
    agentData.profileCompleteness = getProfileCompleteness(
      agentData,
      AGENT_PROFILE_FIELDS,
    );

    res.status(201).json({
      success: true,
      message: "Agent profile created.",
      data: agentData,
    });
  } catch (error) {
    console.error("Create agent by user id error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This user already has an agent profile.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create agent profile.",
    });
  }
};
