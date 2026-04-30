/**
 * Shared property list filter (query params / saved-search filters).
 * @param {Record<string, string | undefined>} reqQuery
 * @returns {Record<string, unknown>}
 */
export function buildPropertyFindQuery(reqQuery) {
  const {
    search,
    deal,
    type,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    availability,
    furnishing,
    postedBy,
    propertyCategory,
    bedrooms,
    city,
    sector,
    projectId,
    nearLat,
    nearLng,
    nearKm,
    bbox,
    polygon,
  } = reqQuery;

  const query = { isActive: true, deletedAt: null };

  if (search) {
    query.$or = [
      { "location.state": { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];
  }

  if (city) {
    query["location.city"] = { $regex: `^${city}$`, $options: "i" };
  }

  if (sector) {
    query["location.sector"] = { $regex: sector, $options: "i" };
  }

  if (availability) query.availability = availability;
  if (deal) query.deal = deal;
  if (type) query.type = type;
  if (furnishing) query.furnishing = furnishing;
  if (postedBy) query.postedBy = postedBy;
  if (propertyCategory) query.propertyCategory = propertyCategory;
  if (bedrooms) {
    if (bedrooms === "5+") {
      query["facilities.bedrooms"] = { $gte: 5 };
    } else {
      query["facilities.bedrooms"] = Number(bedrooms);
    }
  }
  if (projectId) {
    query.projectId = projectId;
  }
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (areaMin || areaMax) {
    query["area.value"] = {};
    if (areaMin) query["area.value"].$gte = Number(areaMin);
    if (areaMax) query["area.value"].$lte = Number(areaMax);
  }

  const hasGeo =
    polygon || bbox || (nearLat && nearLng && nearKm !== undefined);
  if (hasGeo) {
    query["location.coordinates.coordinates.0"] = { $nin: [0, null] };
    query["location.coordinates.coordinates.1"] = { $nin: [0, null] };
  }

  if (polygon) {
    try {
      const ring = JSON.parse(String(polygon));
      if (Array.isArray(ring) && ring.length >= 3) {
        const closed = [...ring];
        const first = closed[0];
        const last = closed[closed.length - 1];
        if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
          closed.push([first[0], first[1]]);
        }
        query["location.coordinates"] = {
          $geoWithin: {
            $geometry: {
              type: "Polygon",
              coordinates: [closed],
            },
          },
        };
      }
    } catch {
      /* ignore bad polygon */
    }
  } else if (bbox) {
    const parts = String(bbox).split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      const [swLng, swLat, neLng, neLat] = parts;
      query["location.coordinates"] = {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat],
          ],
        },
      };
    }
  } else if (nearLat && nearLng && nearKm !== undefined && nearKm !== "") {
    const lat = Number(nearLat);
    const lng = Number(nearLng);
    const km = Number(nearKm);
    if (![lat, lng, km].some(Number.isNaN) && km > 0) {
      query["location.coordinates"] = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: km * 1000,
        },
      };
    }
  }

  return query;
}

export function transformPropertyCoordinates(propertyObj) {
  if (
    propertyObj.location &&
    propertyObj.location.coordinates &&
    propertyObj.location.coordinates.coordinates
  ) {
    const [lng, lat] = propertyObj.location.coordinates.coordinates;
    propertyObj.location.coordinates = { lat, lng };
  }
  return propertyObj;
}

export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
