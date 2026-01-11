import { generateWithGemini } from "../../config/gemini.js";

export async function generateMatchScore(data) {
  const prompt = `
You are an intelligent real estate recommendation system.

User preferences:
${JSON.stringify(data.userPreferences, null, 2)}

Property details:
${JSON.stringify(data.property, null, 2)}

Respond ONLY in JSON with:
{
  "score": number (0-100),
  "reasons": [string, string],
  "warning": string | null
}
`;

  const response = await generateWithGemini(prompt);
  return JSON.parse(response);
}
