import { SiteSettings } from "../models/SiteSettings.js";

// Get Site Settings
export const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    res.status(200).json(settings || {});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching site settings", error: error.message });
  }
};

// Create Site Settings (only if not exists)
export const createSiteSettings = async (req, res) => {
  try {
    const existing = await SiteSettings.findOne();
    if (existing) {
      return res
        .status(400)
        .json({ message: "Settings already exist. Use update instead." });
    }

    const settings = new SiteSettings(req.body);
    await settings.save();
    res.status(201).json(settings);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating site settings", error: error.message });
  }
};

// Update Site Settings
export const updateSiteSettings = async (req, res) => {
  try {
    //console.log("heleeooeoe")
    const { id } = req.params;
    //console.log(id,"id of site")
    const settings = await SiteSettings.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating site settings", error: error.message });
  }
};

// Delete Site Settings
export const deleteSiteSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await SiteSettings.findByIdAndDelete(id);

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({ message: "Settings deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting site settings", error: error.message });
  }
};
