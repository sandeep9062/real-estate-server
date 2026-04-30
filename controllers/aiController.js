import {
  generatePropertyDescription,
  generateSeoMeta,
  generateMatchScore,
  generateLocalityGuide,
  extractPropertyDetails,
} from "../services/ai/index.js";

export const generatePropertyDescriptionController = async (req, res) => {
  const description = await generatePropertyDescription(req.body);
  res.json({ success: true, description });
};

export const generatePropertyDetailsController = async (req, res) => {
  try {
    const text = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Paste your property text to use magic fill.",
      });
    }
    const details = await extractPropertyDetails(text.trim());
    return res.json({ success: true, data: details });
  } catch (err) {
    console.error("magic-fill:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Magic fill failed. Try again.",
    });
  }
};

export const generateSeoMetaController = async (req, res) => {
  const meta = await generateSeoMeta(req.body);
  res.json({ success: true, meta });
};

export const generateMatchScoreController = async (req, res) => {
  const result = await generateMatchScore(req.body);
  res.json({ success: true, result });
};

export const generateLocalityGuideController = async (req, res) => {
  const content = await generateLocalityGuide(req.body);
  res.json({ success: true, content });
};
