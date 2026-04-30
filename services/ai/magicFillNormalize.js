/**
 * Normalizes AI magic-fill JSON into shapes the listing UI and API expect.
 */

const DEAL = ["Rent", "Sale"];
const TYPE = ["Residential", "Commercial", "Industrial", "Agricultural"];
const PROPERTY_CATEGORIES = [
  "Apartment/Flat",
  "House/Villa",
  "Land/Plot",
  "Studio Apartment",
  "Builder Floor",
  "PG/Hostel",
  "Farmhouse",
  "Retail",
  "Office",
  "Industrial",
  "Warehouse",
  "Shop/Showroom",
];
const AVAILABILITY = ["Ready to Move", "Under Construction"];
const FURNISHING = [
  "Furnished",
  "Fully Furnished",
  "Semi Furnished",
  "Un-Furnished",
];
const POSTED_BY = ["Owner", "Agent", "Builder"];
const LISTING_AVAIL = ["Available", "Fresh", "Under offer", "Booked"];
const OC_STATUS = ["Available", "Applied", "Not issued", "NA"];
const PARKING_TYPE = ["None", "Open", "Covered", "Both"];
const AREA_UNITS = ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"];

const AMENITIES_CANON = [
  "Parking",
  "Lift",
  "Power Backup",
  "Security",
  "Park",
  "Gas Pipeline",
  "Wifi",
  "Gym",
  "Swimming Pool",
  "Club House",
];

function pickEnum(value, allowed, fallback) {
  if (value == null || value === "") return fallback;
  const v = String(value).trim();
  const lower = v.toLowerCase();
  const exact = allowed.find((a) => a.toLowerCase() === lower);
  if (exact) return exact;
  const loose = allowed.find(
    (a) =>
      lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower),
  );
  if (loose) return loose;
  return fallback;
}

function toInt(v, def = 0) {
  if (v == null || v === "") return def;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d.-]/g, ""), 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(0, Math.round(n));
}

function toOptPositiveNumber(v) {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100) / 100;
}

function parseInrPrice(raw) {
  if (raw == null || raw === "") return 0;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return Math.round(raw);
  }
  const s = String(raw).toLowerCase().replace(/[₹,\s]/g, " ").trim();
  const cr = /(\d+\.?\d*)\s*(crore|cr)\b/i.exec(s);
  if (cr) return Math.round(parseFloat(cr[1]) * 1e7);
  const lac = /(\d+\.?\d*)\s*(lakh|lac|lacs)\b/i.exec(s);
  if (lac) return Math.round(parseFloat(lac[1]) * 1e5);
  const k = /(\d+\.?\d*)\s*k\b/i.exec(s);
  if (k) return Math.round(parseFloat(k[1]) * 1e3);
  const digits = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(digits) && digits >= 0 ? Math.round(digits) : 0;
}

function extractPriceFromSourceText(text) {
  if (!text || typeof text !== "string") return 0;
  const t = text.replace(/,/g, "");
  const patterns = [
    /(\d+\.?\d*)\s*(crore|cr)\b/gi,
    /(\d+\.?\d*)\s*(lakh|lac|lacs)\b/gi,
    /₹\s*(\d+(?:\.\d+)?)/g,
    /\brs\.?\s*(\d+(?:\.\d+)?)\b/gi,
    /price[:\s]+(\d+(?:\.\d+)?)/gi,
  ];
  let best = 0;
  const tryNum = (n, mult = 1) => {
    const x = Math.round(parseFloat(n) * mult);
    if (Number.isFinite(x) && x > best) best = x;
  };
  let m;
  const crRe = /(\d+\.?\d*)\s*(crore|cr)\b/gi;
  while ((m = crRe.exec(t)) !== null) tryNum(m[1], 1e7);
  const lacRe = /(\d+\.?\d*)\s*(lakh|lac|lacs)\b/gi;
  while ((m = lacRe.exec(t)) !== null) tryNum(m[1], 1e5);
  const plain = /(?:₹|rs\.?|price|rent)\s*[:\s]*(\d{5,})/gi;
  while ((m = plain.exec(t)) !== null) tryNum(m[1], 1);
  return best;
}

function normalizeFurnishing(v) {
  const x = String(v || "").toLowerCase();
  if (!x) return "Un-Furnished";
  if (x.includes("semi")) return "Semi Furnished";
  if (x.includes("un") && x.includes("fur")) return "Un-Furnished";
  if (x.includes("full") && x.includes("fur")) return "Fully Furnished";
  if (x.includes("fur")) return "Furnished";
  return pickEnum(v, FURNISHING, "Un-Furnished");
}

function splitList(v) {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(v)
    .split(/[\n|,;•]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchAmenity(raw) {
  const lower = String(raw).toLowerCase().trim();
  if (!lower) return null;
  const hit = AMENITIES_CANON.find(
    (a) =>
      a.toLowerCase() === lower ||
      lower.includes(a.toLowerCase()) ||
      a.toLowerCase().includes(lower),
  );
  if (hit) return hit;
  if (lower.includes("gym")) return "Gym";
  if (lower.includes("pool") || lower.includes("swim")) return "Swimming Pool";
  if (lower.includes("lift") || lower.includes("elevator")) return "Lift";
  if (lower.includes("backup") || lower.includes("generator")) return "Power Backup";
  if (lower.includes("wifi") || lower.includes("wi-fi")) return "Wifi";
  if (lower.includes("club")) return "Club House";
  if (lower.includes("gas")) return "Gas Pipeline";
  if (lower.includes("security") || lower.includes("cctv")) return "Security";
  return null;
}

function normalizeAmenities(v) {
  const items = splitList(v);
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const m = matchAmenity(item);
    if (m && !seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

function normalizeAmenitiesArray(arr) {
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    const m = matchAmenity(item);
    if (m && !seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

function normalizeCoordinates(coords) {
  if (coords == null) return { lat: 0, lng: 0 };
  if (Array.isArray(coords) && coords.length >= 2) {
    const [a, b] = coords.map(Number);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return { lat: 0, lng: 0 };
    // Heuristic for India / typical map: lat ~ 8–37, lng ~ 68–97
    if (a >= 60 && a <= 100 && b >= 6 && b <= 40) {
      return { lat: b, lng: a };
    }
    if (b >= 60 && b <= 100 && a >= 6 && a <= 40) {
      return { lat: a, lng: b };
    }
    return { lat: a, lng: b };
  }
  if (typeof coords === "object") {
    const lat = Number(coords.lat ?? coords.latitude);
    const lng = Number(
      coords.lng ?? coords.longitude ?? coords.lon ?? coords.long,
    );
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return { lat: 0, lng: 0 };
}

function normalizeNearbyPlaces(np) {
  if (!np || typeof np !== "object") {
    return {
      schools: [],
      metroStations: [],
      hospitals: [],
      malls: [],
    };
  }
  return {
    schools: splitList(np.schools),
    metroStations: splitList(np.metroStations ?? np.metro ?? np.transit),
    hospitals: splitList(np.hospitals),
    malls: splitList(np.malls ?? np.shopping),
  };
}

function coerceBool(v, defaultVal = true) {
  if (typeof v === "boolean") return v;
  if (v == null) return defaultVal;
  const s = String(v).toLowerCase();
  if (["false", "no", "fixed", "non-negotiable", "non negotiable"].includes(s)) {
    return false;
  }
  if (["true", "yes", "negotiable"].includes(s)) return true;
  return defaultVal;
}

/**
 * @param {Record<string, unknown>} raw - Parsed JSON from Gemini
 * @param {string} [sourceText] - Original user paste (fallback price extraction)
 */
export function normalizeMagicFillPayload(raw, sourceText = "") {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  let price = parseInrPrice(raw.price);
  if (price === 0 && sourceText) {
    const fallback = extractPriceFromSourceText(sourceText);
    if (fallback > 0) price = fallback;
  }

  const deal = pickEnum(raw.deal, DEAL, "Rent");
  const areaRaw = raw.area && typeof raw.area === "object" ? raw.area : {};
  const locRaw = raw.location && typeof raw.location === "object" ? raw.location : {};

  const facilitiesRaw =
    raw.facilities && typeof raw.facilities === "object" ? raw.facilities : {};

  const location = {
    address: String(locRaw.address ?? "").trim(),
    city: String(locRaw.city ?? "").trim(),
    state: String(locRaw.state ?? "").trim(),
    country: String(locRaw.country ?? "IN").trim() || "IN",
    pincode: String(locRaw.pincode ?? "").trim(),
    coordinates: normalizeCoordinates(locRaw.coordinates),
  };

  const facilities = {
    bedrooms: toInt(facilitiesRaw.bedrooms, 0),
    bathrooms: toInt(facilitiesRaw.bathrooms, 0),
    parkings: toInt(facilitiesRaw.parkings ?? facilitiesRaw.parking, 0),
    servantRooms: toInt(facilitiesRaw.servantRooms, 0),
    balconies: toInt(facilitiesRaw.balconies, 0),
  };
  const pt = pickEnum(facilitiesRaw.parkingType, PARKING_TYPE, null);
  if (pt && pt !== "None") facilities.parkingType = pt;
  else if (pt === "None") facilities.parkingType = "None";

  const amenitiesFromRaw = Array.isArray(raw.amenities)
    ? normalizeAmenitiesArray(raw.amenities)
    : normalizeAmenities(raw.amenities);

  const oc = pickEnum(raw.ocStatus ?? raw.oc, OC_STATUS, "");
  const title = String(raw.title ?? "").trim();
  const description = String(raw.description ?? "").trim();

  return {
    title: title.slice(0, 200),
    description: description.slice(0, 8000),
    price,
    deal,
    type: pickEnum(raw.type, TYPE, "Residential"),
    propertyCategory: pickEnum(
      raw.propertyCategory ?? raw.category,
      PROPERTY_CATEGORIES,
      "Apartment/Flat",
    ),
    availability: pickEnum(raw.availability, AVAILABILITY, "Ready to Move"),
    furnishing: normalizeFurnishing(raw.furnishing),
    facing: String(raw.facing ?? "").trim(),
    postedBy: pickEnum(raw.postedBy, POSTED_BY, "Owner"),
    listingAvailability: pickEnum(
      raw.listingAvailability,
      LISTING_AVAIL,
      "Available",
    ),
    area: {
      value: toInt(areaRaw.value ?? areaRaw.size ?? raw.sqft, 0),
      unit: pickEnum(areaRaw.unit, AREA_UNITS, "sqft"),
    },
    location,
    facilities,
    maintenanceCharge: toOptPositiveNumber(raw.maintenanceCharge),
    securityDeposit: toOptPositiveNumber(raw.securityDeposit),
    lockInMonths: toOptPositiveNumber(raw.lockInMonths),
    noticePeriodDays: toOptPositiveNumber(raw.noticePeriodDays),
    ageOfProperty: toOptPositiveNumber(raw.ageOfProperty ?? raw.propertyAge),
    pricePerSqft: toOptPositiveNumber(raw.pricePerSqft ?? raw.price_per_sqft),
    negotiable: coerceBool(raw.negotiable, true),
    ocStatus: oc || undefined,
    amenities: amenitiesFromRaw,
    reraNumber: String(raw.reraNumber ?? raw.rera ?? "").trim(),
    virtualTourUrl: String(raw.virtualTourUrl ?? "").trim(),
    videoUrl: String(raw.videoUrl ?? raw.video ?? "").trim(),
    nearbyPlaces: normalizeNearbyPlaces(raw.nearbyPlaces),
    commercialPropertyTypes: splitList(raw.commercialPropertyTypes),
    investmentOptions: splitList(raw.investmentOptions),
    floor: toOptPositiveNumber(raw.floor ?? raw.floorNumber),
  };
}
