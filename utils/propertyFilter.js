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
    bathrooms,
    balconies,
    parkings,
    facing,
    tenantPreference,
    ownershipType,
    petsAllowed,
    floorMin,
    floorMax,
    totalFloors,
    city,
    sector,
    projectId,
    nearLat,
    nearLng,
    nearKm,
    bbox,
    polygon,
    includeInactive,
    isFeatured,
    landmark,
    builderName,
    projectName,
    listingAvailability,
    isVerified,
  } = reqQuery;

  const query = { deletedAt: null };
  if (includeInactive !== "true") {
    query.isActive = true;
  }

  if (search) {
    query.$or = [
      { "location.state": { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } },
      { "location.sector": { $regex: search, $options: "i" } },
      { "location.country": { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];
  }

  /* ── City: case-insensitive anchored regex with whitespace trimming ── */
  if (city) {
    const trimmed = city.trim();
    query["location.city"] = {
      $regex: `^${escapeRegex(trimmed)}$`,
      $options: "i",
    };
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

  /* ── Bedrooms: cast to Number, handle "5+" and "0" edge cases ── */
  if (bedrooms !== undefined && bedrooms !== null && bedrooms !== "") {
    if (bedrooms === "5+") {
      query["facilities.bedrooms"] = { $gte: 5 };
    } else if (Number(bedrooms) > 0) {
      query["facilities.bedrooms"] = Number(bedrooms);
    }
  }

  /* ── Bathrooms ── */
  if (bathrooms !== undefined && bathrooms !== null && bathrooms !== "") {
    if (bathrooms === "5+") {
      query["facilities.bathrooms"] = { $gte: 5 };
    } else if (Number(bathrooms) > 0) {
      query["facilities.bathrooms"] = Number(bathrooms);
    }
  }

  /* ── Balconies ── */
  if (balconies !== undefined && balconies !== null && balconies !== "") {
    if (balconies === "3+") {
      query["facilities.balconies"] = { $gte: 3 };
    } else if (Number(balconies) > 0) {
      query["facilities.balconies"] = Number(balconies);
    }
  }

  /* ── Parking ── */
  if (parkings !== undefined && parkings !== null && parkings !== "") {
    if (parkings === "4+") {
      query["facilities.parkings"] = { $gte: 4 };
    } else if (Number(parkings) > 0) {
      query["facilities.parkings"] = Number(parkings);
    }
  }

  /* ── Facing (direction) ── */
  if (facing) {
    query.facing = { $regex: `^${escapeRegex(facing)}$`, $options: "i" };
  }

  /* ── Tenant Preference ── */
  if (tenantPreference) {
    query.tenantPreference = tenantPreference;
  }

  /* ── Ownership Type ── */
  if (ownershipType) {
    query.ownershipType = ownershipType;
  }

  /* ── Pets Allowed ── */
  if (petsAllowed === "true") {
    query.petsAllowed = true;
  } else if (petsAllowed === "false") {
    query.petsAllowed = false;
  }

  /* ── Floor range ── */
  if (floorMin || floorMax) {
    query.floor = {};
    if (floorMin) query.floor.$gte = Number(floorMin);
    if (floorMax) query.floor.$lte = Number(floorMax);
  }

  /* ── Total floors ── */
  if (totalFloors) {
    query["facilities.totalFloors"] = Number(totalFloors);
  }

  /* ── Builder / Project name (partial match) ── */
  if (builderName) {
    query.builderName = { $regex: builderName, $options: "i" };
  }
  if (projectName) {
    query.projectName = { $regex: projectName, $options: "i" };
  }

  /* ── Listing availability status ── */
  if (listingAvailability) {
    query.listingAvailability = listingAvailability;
  }

  /* ── Verified only ── */
  if (isVerified === "true") {
    query.isVerified = true;
  }

  if (projectId) {
    query.projectId = projectId;
  }
  if (isFeatured === "true") {
    query.isFeatured = true;
  }

  /* ── Price range: $lte for maxPrice, $gte for minPrice ── */
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

  /* ── Multi-token landmark (regex OR block) ── */
  if (landmark && landmark.trim()) {
    const tokens = String(landmark)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => escapeRegex(t));

    if (tokens.length > 0) {
      // Build a "match-all-tokens" regex: /(?=.*token1)(?=.*token2)/i
      const joinedRegex = tokens.map((t) => `(?=.*${t})`).join("");

      const landmarkOr = [
        { "location.address": { $regex: joinedRegex, $options: "i" } },
        { "location.sector": { $regex: joinedRegex, $options: "i" } },
        { "location.landmark": { $regex: joinedRegex, $options: "i" } },
        { title: { $regex: joinedRegex, $options: "i" } },
      ];

      // If search already set query.$or, we must keep BOTH conditions.
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: landmarkOr }];
        delete query.$or;
      } else {
        query.$or = landmarkOr;
      }
    }
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
