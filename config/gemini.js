import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini Client
 * IMPORTANT:
 * - This file must ONLY be used on server
 * - Never expose API key to frontend
 */

let genAI = null;

const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY is missing in environment variables");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Gemini 2.5 Flash Model
 * - Fast
 * - Cheap
 * - Perfect for real estate AI tasks
 */
export const getGeminiModel = () => {
  const genAI = initializeGemini();
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4,          // Stable + professional output
      maxOutputTokens: 1024,     // Enough for long descriptions
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUAL_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });
};

/**
 * Helper function (recommended)
 * Centralized Gemini call
 */
export async function generateWithGemini(prompt) {
  try {
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}
