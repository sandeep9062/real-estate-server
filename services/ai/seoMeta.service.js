import { generateWithGemini } from "../../config/gemini.js";

export async function generateSeoMeta(property) {
  const prompt = `
Generate SEO metadata for this property listing.

Details:
${JSON.stringify(property, null, 2)}

Rules:
- Title ≤ 60 characters
- Meta description ≤ 155 characters
- Include city & locality
- Respond ONLY in JSON:
{
  "title": "",
  "description": ""
}
`;

  const response = await generateWithGemini(prompt);
  return JSON.parse(response);
}
