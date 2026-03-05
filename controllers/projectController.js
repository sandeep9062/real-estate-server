import Project from "../models/Project.js";

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
      .populate("media.images")
      .populate("amenities");

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
      .populate("media.images")
      .populate("amenities");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project by ID
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("developer", "name logo")
      .populate("media.images")
      .populate("amenities");

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

// @desc    Create Project (Admin/Builder Only)
export const createProject = async (req, res) => {
  try {
    // Add logic here to ensure the user has 'admin' or 'builder' role
    const newProject = await Project.create(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
