import Project from "../models/Project.js";

// Helper to extract uploaded image URLs from req.files
function getUploadedImages(req) {
  const f = req.files;
  if (!f) return [];
  if (Array.isArray(f)) {
    return f.map((file) => file.path || file.secure_url);
  }
  const imgs = f.images || [];
  return imgs.map((file) => file.path || file.secure_url);
}

// Helper to parse JSON fields from multipart form data
function parseField(value) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// @desc    Get all projects with filters (Location, Status, Price)
export const getProjects = async (req, res) => {
  try {
    const { city, status, minPrice } = req.query;
    let query = {};

    if (city) query["location.city"] = city;
    if (status) query.constructionStatus = status;
    if (minPrice) query["pricing.from"] = { $gte: Number(minPrice) };

    const projects = await Project.find(query)
      .populate("developer", "name logo") // Only get dev name and logo
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by slug
export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({ slug })
      .populate("developer", "name logo")
      .populate("media.images");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("developer", "name logo")
      .populate("media.images");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Project (Admin/Builder Only)
export const createProject = async (req, res) => {
  try {
    // Get uploaded images from multer/Cloudinary
    const uploadedImages = getUploadedImages(req);

    // Parse the body fields (they come as strings in multipart form)
    let projectData = { ...req.body };

    // Parse nested objects if they were sent as JSON strings
    if (typeof projectData.location === "string") {
      projectData.location = parseField(projectData.location);
    }
    if (typeof projectData.pricing === "string") {
      projectData.pricing = parseField(projectData.pricing);
    }
    if (typeof projectData.media === "string") {
      projectData.media = parseField(projectData.media);
    }
    if (typeof projectData.stats === "string") {
      projectData.stats = parseField(projectData.stats);
    }
    if (typeof projectData.seo === "string") {
      projectData.seo = parseField(projectData.seo);
    }
    if (typeof projectData.amenities === "string") {
      projectData.amenities = parseField(projectData.amenities);
    }
    if (typeof projectData.location === "string") {
      projectData.location = parseField(projectData.location);
    }

    // Merge uploaded images with any existing image URLs from the body
    const existingImages = Array.isArray(projectData.media?.images)
      ? projectData.media.images
      : [];

    projectData.media = {
      ...(projectData.media || {}),
      images: [...existingImages, ...uploadedImages],
    };

    // Convert pricing from/to to numbers
    if (projectData.pricing?.from) {
      projectData.pricing.from = Number(projectData.pricing.from);
    }
    if (projectData.pricing?.to) {
      projectData.pricing.to = Number(projectData.pricing.to);
    }

    // Convert stats to numbers
    if (projectData.stats?.totalUnits) {
      projectData.stats.totalUnits = Number(projectData.stats.totalUnits);
    }
    if (projectData.stats?.availableUnits) {
      projectData.stats.availableUnits = Number(
        projectData.stats.availableUnits,
      );
    }

    // Convert pricing numeric fields from string to number
    if (projectData.pricing?.from)
      projectData.pricing.from = Number(projectData.pricing.from);
    if (projectData.pricing?.to)
      projectData.pricing.to = Number(projectData.pricing.to);

    // Convert coordinate strings to numbers
    if (projectData.location?.coordinates?.lat) {
      projectData.location.coordinates.lat = Number(
        projectData.location.coordinates.lat,
      );
    }
    if (projectData.location?.coordinates?.lng) {
      projectData.location.coordinates.lng = Number(
        projectData.location.coordinates.lng,
      );
    }

    const newProject = await Project.create(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update project by ID
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Get uploaded images from multer/Cloudinary
    const uploadedImages = getUploadedImages(req);

    let updateData = { ...req.body };

    // Parse nested objects if they were sent as JSON strings
    if (typeof updateData.location === "string") {
      updateData.location = parseField(updateData.location);
    }
    if (typeof updateData.pricing === "string") {
      updateData.pricing = parseField(updateData.pricing);
    }
    if (typeof updateData.media === "string") {
      updateData.media = parseField(updateData.media);
    }
    if (typeof updateData.stats === "string") {
      updateData.stats = parseField(updateData.stats);
    }
    if (typeof updateData.seo === "string") {
      updateData.seo = parseField(updateData.seo);
    }
    if (typeof updateData.amenities === "string") {
      updateData.amenities = parseField(updateData.amenities);
    }

    // Handle images merging
    const existingImages = Array.isArray(updateData.media?.images)
      ? updateData.media.images
      : [];

    // If existingImages is a string (from form data), it could be JSON
    if (typeof updateData.media?.images === "string") {
      try {
        const parsed = JSON.parse(updateData.media.images);
        updateData.media.images = Array.isArray(parsed) ? parsed : [];
      } catch {
        updateData.media.images = [];
      }
    }

    if (uploadedImages.length > 0) {
      updateData.media = {
        ...(updateData.media || {}),
        images: [...(updateData.media?.images || []), ...uploadedImages],
      };
    }

    // Convert numeric fields
    if (updateData.pricing?.from)
      updateData.pricing.from = Number(updateData.pricing.from);
    if (updateData.pricing?.to)
      updateData.pricing.to = Number(updateData.pricing.to);
    if (updateData.stats?.totalUnits)
      updateData.stats.totalUnits = Number(updateData.stats.totalUnits);
    if (updateData.stats?.availableUnits)
      updateData.stats.availableUnits = Number(updateData.stats.availableUnits);
    if (updateData.location?.coordinates?.lat)
      updateData.location.coordinates.lat = Number(
        updateData.location.coordinates.lat,
      );
    if (updateData.location?.coordinates?.lng)
      updateData.location.coordinates.lng = Number(
        updateData.location.coordinates.lng,
      );

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("developer", "name logo")
      .populate("media.images");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project by ID
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
