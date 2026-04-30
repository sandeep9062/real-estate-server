import { generateJsonWithGemini } from "../../config/gemini.js";
import { normalizeMagicFillPayload } from "./magicFillNormalize.js";

function buildMagicFillPrompt(input) {
  return `You extract Indian real-estate listing data from messy notes (WhatsApp, broker blurbs, classifieds, HTML). Output a single JSON object matching the schema below. No markdown, no commentary.

RULES:
- price: INTEGER INR. Convert lakhs/lac (×100000), crore/cr (×10000000). Example: "45 lakhs" → 4500000, "1.2 cr" → 12000000. For Rent, price is monthly rent.
- deal: exactly "Rent" or "Sale".
- type: "Residential" | "Commercial" | "Industrial" | "Agricultural".
- propertyCategory: one of Apartment/Flat, House/Villa, Land/Plot, Studio Apartment, Builder Floor, PG/Hostel, Farmhouse, Retail, Office, Industrial, Warehouse, Shop/Showroom.
- availability: "Ready to Move" or "Under Construction".
- furnishing: "Furnished" | "Fully Furnished" | "Semi Furnished" | "Un-Furnished".
- postedBy: "Owner" | "Agent" | "Builder" (broker/agent → Agent).
- listingAvailability: "Available" | "Fresh" | "Under offer" | "Booked" (default Available).
- area: { "value": number (min 0), "unit": "sqft"|"sqyard"|"sqm"|"marla"|"kanal"|"acre" }. Map "sq ft", "square feet" → sqft.
- location: { "address", "city", "state", "country" (ISO code, default "IN"), "pincode", "coordinates": { "lat": number, "lng": number } }. Use 0,0 for lat/lng if unknown.
- facilities: { "bedrooms", "bathrooms", "parkings", "servantRooms", "balconies" (integers ≥0), "parkingType": "None"|"Open"|"Covered"|"Both" or null }. Map "3BHK"/"3 BHK" → bedrooms 3.
- If deal is Rent and text mentions maintenance, deposit, lock-in, notice: set maintenanceCharge, securityDeposit, lockInMonths, noticePeriodDays as integers (INR or months/days as stated).
- If deal is Sale: set pricePerSqft (integer) when computable; ocStatus: "Available"|"Applied"|"Not issued"|"NA" or null.
- ageOfProperty: integer years if stated (e.g. "5 year old" → 5).
- negotiable: boolean (explicit "fixed price" / "non-negotiable" → false).
- amenities: array of canonical strings only: Parking, Lift, Power Backup, Security, Park, Gas Pipeline, Wifi, Gym, Swimming Pool, Club House.
- nearbyPlaces: { "schools", "metroStations", "hospitals", "malls" } — each an array of short strings; split comma/newline lists.
- reraNumber, virtualTourUrl, videoUrl: strings or null.
- commercialPropertyTypes, investmentOptions: arrays only when type is Commercial; else [] or null.
- floor: integer storey if "2nd floor"/"floor 5" mentioned.
- title: ≤120 characters, compelling. description: 2–6 sentences, professional, buyer-focused, plain text.

Use null for any field you cannot infer. Do not fabricate RERA, OC, or exact coordinates.

INPUT TEXT:
${JSON.stringify(input)}
`;
}

export async function extractPropertyDetails(text) {
  const input = typeof text === "string" ? text.trim() : "";
  if (!input) {
    throw new Error("No text provided");
  }

  const prompt = buildMagicFillPrompt(input);
  const jsonStr = await generateJsonWithGemini(prompt);

  let raw;
  try {
    raw = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Magic fill JSON parse error:", e.message, jsonStr?.slice(0, 400));
    throw new Error("Could not parse AI response. Try shorter or clearer listing text.");
  }

  return normalizeMagicFillPayload(raw, input);
}
