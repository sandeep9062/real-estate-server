import Property from "../models/Property.js";

const NINETY_DAYS = 90;
const PREV_DAYS = 180;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function median(sorted) {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function priceTag(trend) {
  if (trend === null) return "New Data";
  if (trend > 8) return "Overpriced";
  if (trend < -5) return "Value Deal";
  return "Fair Market";
}

function yieldTag(pct) {
  if (pct >= 4.5) return "High Yield";
  if (pct >= 3) return "Moderate Yield";
  return "Low Yield";
}

async function aggregate(fromDate, toDate = null) {
  const match = {
    isActive: true,
    price: { $gt: 0 },
    deal: { $in: ["Rent", "Sale"] },
    createdAt: { $gte: fromDate },
  };
  if (toDate) match.createdAt.$lt = toDate;

  const pipeline = [
    { $match: match },
    { $sort: { price: 1 } },
    {
      $group: {
        _id: {
          sector: "$location.sector",
          city: "$location.city",
          propertyType: "$propertyCategory",
          deal: "$deal",
        },
        prices: { $push: "$price" },
        areas: { $push: "$area.value" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        sector: "$_id.sector",
        city: "$_id.city",
        propertyType: "$_id.propertyType",
        deal: "$_id.deal",
        count: 1,
        prices: 1,
        areas: 1,
      },
    },
  ];

  const rows = await Property.aggregate(pipeline);

  // Filter out rows where sector is null/undefined (no location data)
  const valid = rows.filter((r) => r.sector && r.city && r.propertyType);

  return valid.map((r) => {
    const sorted = [...r.prices].sort((a, b) => a - b);
    const med = median(sorted);
    const validAreas = r.areas.filter((a) => a && a > 0);
    const avgArea = validAreas.length
      ? Math.round(validAreas.reduce((s, a) => s + a, 0) / validAreas.length)
      : null;
    const pricePerSqft = avgArea ? Math.round(med / avgArea) : null;

    const listingType = r.deal === "Rent" ? "rent" : "sale";

    return {
      sector: r.sector,
      city: r.city,
      propertyType: r.propertyType,
      listingType,
      count: r.count,
      medianPrice: med,
      minPrice: sorted[0],
      maxPrice: sorted[sorted.length - 1],
      avgArea,
      pricePerSqft,
    };
  });
}

export async function generateMarketIndex() {
  const [current, previous] = await Promise.all([
    aggregate(daysAgo(NINETY_DAYS)),
    aggregate(daysAgo(PREV_DAYS), daysAgo(NINETY_DAYS)),
  ]);

  function enrich(row) {
    const prev = previous.find(
      (p) =>
        p.sector === row.sector &&
        p.propertyType === row.propertyType &&
        p.listingType === row.listingType,
    );
    const trend =
      prev && prev.medianPrice
        ? Math.round(
            ((row.medianPrice - prev.medianPrice) / prev.medianPrice) * 100,
          )
        : null;
    return { ...row, trend, priceTag: priceTag(trend) };
  }

  const enriched = current.map(enrich);
  const rentData = enriched.filter(
    (r) => r.listingType === "rent" && r.count >= 3,
  );
  const saleData = enriched.filter(
    (r) => r.listingType === "sale" && r.count >= 2,
  );

  // Rental yield — match rent + sale by sector + propertyType
  const yieldData = saleData
    .map((sale) => {
      const rent = rentData.find(
        (r) => r.sector === sale.sector && r.propertyType === sale.propertyType,
      );
      if (!rent) return null;
      const annualRent = rent.medianPrice * 12;
      const pct = parseFloat(
        ((annualRent / sale.medianPrice) * 100).toFixed(1),
      );
      return {
        sector: sale.sector,
        city: sale.city,
        propertyType: sale.propertyType,
        salePrice: sale.medianPrice,
        monthlyRent: rent.medianPrice,
        annualYield: pct,
        yieldTag: yieldTag(pct),
        pricePerSqft: sale.pricePerSqft,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.annualYield - a.annualYield);

  return {
    rentData: rentData.sort((a, b) =>
      (a.sector || "").localeCompare(b.sector || ""),
    ),
    saleData: saleData.sort((a, b) =>
      (a.sector || "").localeCompare(b.sector || ""),
    ),
    yieldData,
    totalListings: enriched.reduce((s, r) => s + r.count, 0),
  };
}
