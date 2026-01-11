import { generateWithGemini } from "../../config/gemini.js";

export async function generateLocalityGuide({ city, locality }) {
  const prompt = `
You are a local real estate expert.

Write a detailed rental guide for students living in:
${locality}, ${city}

Include:
- Average rent
- Safety
- Nearby colleges
- Transport
- Pros & cons
- Who should live here

Tone: trustworthy, local expert
Length: 700–900 words
`;

  return await generateWithGemini(prompt);
}
