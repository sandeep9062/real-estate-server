import Developer from "../models/Developer.js";
import Project from "../models/Project.js";
import mongoose from "mongoose";

// @desc    Get all developers with project counts
export const getDevelopers = async (req, res) => {
  try {
    const { featured, status } = req.query;
    const filter = {};
    if (featured === "true") filter.featured = true;
    if (status) filter.status = status;
    else filter.status = "active";

    const developers = await Developer.find(filter).sort({ name: 1 }).lean();

    // Attach project count to each developer
    const developerIds = developers.map((d) => d._id);
    const projectCounts = await Project.aggregate([
      { $match: { developer: { $in: developerIds } } },
      { $group: { _id: "$developer", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    projectCounts.forEach((p) => {
      countMap[p._id.toString()] = p.count;
    });

    const enriched = developers.map((dev) => ({
      ...dev,
      projectCount: countMap[dev._id.toString()] || 0,
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single developer and their projects
export const getDeveloperById = async (req, res) => {
  try {
    const { id } = req.params;

    // Support lookup by both _id and slug
    let developer;
    if (mongoose.Types.ObjectId.isValid(id)) {
      developer = await Developer.findById(id);
    } else {
      developer = await Developer.findOne({ slug: id });
    }

    if (!developer)
      return res.status(404).json({ message: "Developer not found" });

    // Fetch all projects belonging to this developer
    const projects = await Project.find({ developer: developer._id });

    res.status(200).json({ developer, projects });
  } catch (error) {
    res.status(400).json({ message: "Invalid Developer ID" });
  }
};

// @desc    Create a Developer profile (Admin)
export const createDeveloper = async (req, res) => {
  try {
    const {
      name,
      slug,
      logo,
      coverImage,
      description,
      shortDescription,
      website,
      headquarters,
      cities,
      phone,
      email,
      isVerified,
      featured,
      establishedYear,
      completedProjects,
      ongoingProjects,
      totalUnitsDelivered,
      socialLinks,
      awards,
      gallery,
      rating,
      totalReviews,
      metaTitle,
      metaDescription,
    } = req.body;

    const developerExists = await Developer.findOne({ name });
    if (developerExists)
      return res.status(400).json({ message: "Developer already exists" });

    const developer = await Developer.create({
      name,
      slug,
      logo,
      coverImage,
      description,
      shortDescription,
      website,
      headquarters,
      cities: cities ? (Array.isArray(cities) ? cities : [cities]) : undefined,
      phone,
      email,
      isVerified,
      featured,
      establishedYear,
      completedProjects,
      ongoingProjects,
      totalUnitsDelivered,
      socialLinks,
      awards,
      gallery,
      rating,
      totalReviews,
      metaTitle,
      metaDescription,
    });
    res.status(201).json(developer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update Developer details
export const updateDeveloper = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "slug",
      "logo",
      "coverImage",
      "description",
      "shortDescription",
      "website",
      "headquarters",
      "cities",
      "phone",
      "email",
      "isVerified",
      "featured",
      "status",
      "establishedYear",
      "completedProjects",
      "ongoingProjects",
      "totalUnitsDelivered",
      "socialLinks",
      "awards",
      "gallery",
      "rating",
      "totalReviews",
      "metaTitle",
      "metaDescription",
      "admins",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const developer = await Developer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    );

    if (!developer)
      return res.status(404).json({ message: "Developer not found" });

    res.status(200).json(developer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Developer
export const deleteDeveloper = async (req, res) => {
  try {
    const developer = await Developer.findByIdAndDelete(req.params.id);
    if (!developer)
      return res.status(404).json({ message: "Developer not found" });
    res.status(200).json({ message: "Developer profile removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
