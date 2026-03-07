import { generateWithGemini } from "../../config/gemini.js";

export async function extractPropertyDetails(text) {
  try {
    const prompt = `
    You are a specialized Real Estate Data Parser.
      Extract property details from the text into a STRICT JSON object.
      
      Input: "${text}"

      IMPORTANT: 
      1. Keep the description concise (max 6 sentences) to avoid cutting off.
      2. Return ONLY the JSON object. No backticks.
      3. Format the description as a professional paragraph,buyer-focused description for the 'description' field.
      4. Ensure all numbers are integers.
      
      Structure:
      {
        "title": "",
        "description": "",
        "price": 0,
        "deal": "Rent",
        "type": "Residential",
        "area": { "value": 0, "unit": "sqft" },
        "location": { "address": "", "city": "Chandigarh", "state": "Chandigarh",coordinates: [0,0],country : "IN" },
        "facilities": { "bedrooms": 0, "parkings": 0, "bathrooms": 0 }
      }
    `;

    const response = await generateWithGemini(prompt);
    let responseText = response.text ? response.text() : String(response);

    // 1. Clean Markdown and extra whitespace
    let cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 2. AUTO-HEAL: If the response is cut off, try to close the JSON structure
    if (!cleanedText.endsWith("}")) {
      console.warn("AI response was cut off. Attempting to repair JSON...");
      // Close the description string and the nested objects
      if (cleanedText.includes('"description": "')) {
        cleanedText += '", "facilities": {"bedrooms":0}}'; // Minimal closing
      } else {
        cleanedText += "}";
      }
    }

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      // 3. FINAL FALLBACK: Regex extraction
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e) {
          console.error("Regex parse failed:", match[0]);
        }
      }
      throw new Error("AI output was not valid JSON or was too long.");
    }
  } catch (error) {
    console.error("Magic Fill Error:", error.message);
    throw error;
  }
}
