import { generateWithGemini } from "../../config/gemini.js";

export async function generatePropertyDescription(property) {
  const prompt = `
You are a professional real estate writer in India.

Write a high-quality, SEO-friendly property description.

Property details:
${JSON.stringify(property, null, 2)}

Rules:
- 120–150 words
- Simple English
- Mention locality advantages
- Suitable for students & working professionals
- No emojis
`;

  return await generateWithGemini(prompt);
}
