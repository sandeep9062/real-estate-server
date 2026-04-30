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
      temperature: 0.4, // Stable + professional output
      maxOutputTokens: 1024, // Enough for long descriptions
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
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

    // Check if response exists and has text
    if (!result || !result.response) {
      throw new Error("No response received from Gemini API");
    }

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("Empty response text from Gemini API");
    }

    return result.response;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}

/**
 * Strict JSON output for structured extraction (magic fill).
 */
export async function generateJsonWithGemini(prompt) {
  try {
    const genAI = initializeGemini();
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });
    const result = await geminiModel.generateContent(prompt);
    if (!result?.response) {
      throw new Error("No response received from Gemini API");
    }
    const responseText = result.response.text();
    if (!responseText?.trim()) {
      throw new Error("Empty JSON response from Gemini API");
    }
    return responseText.trim();
  } catch (error) {
    console.error("❌ Gemini JSON Error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}
