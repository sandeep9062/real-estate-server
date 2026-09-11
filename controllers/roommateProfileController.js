import RoommateProfile from "../models/RoommateProfile.js";
import RoomFlat from "../models/RoomFlat.js";
import User from "../models/User.js";

/**
 * Sanitizes searchArea before persistence. `location` may only be kept when
 * it is a proper GeoJSON Point with a 2-element [lng, lat] coordinates array.
 * A bare `{ type: "Point" }` (no coordinates) makes the `searchArea.location`
 * 2dsphere index impossible to build/query and blows up writes with
 * "Can't extract geo keys … Point must be an array or object,
 * instead got type missing."
 */
function normalizeSearchArea(searchArea) {
  if (!searchArea || typeof searchArea !== "object") return undefined;

  const { location, ...rest } = searchArea;
  const coords = location?.coordinates;

  const hasValidCoords =
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((c) => {
      const n = Number(c);
      return typeof n === "number" && Number.isFinite(n);
    });

    return {
    ...rest,
    ...(hasValidCoords
      ? { location: { type: "Point", coordinates: coords.map(Number) } }
      : {}),
  };
}

/**
 * Convert a (possibly Mongoose) profile document to a plain object with
 * string IDs and ISO date strings. Populated references (user, roomFlat)
 * are converted to plain objects with string _id too.
 *
 * This is needed because Mongoose populate() returns plain objects by default
 * but their _id fields stay as ObjectId instances, and date fields stay as
 * Date objects — neither of which compare cleanly with === against strings
 * in the frontend. The frontend typings assume string IDs and ISO date strings.
 */
function serializeProfile(doc) {
  if (!doc) return doc;
  const out = { ...doc };

  // Main _id
  out._id = String(out._id);

  // Populated user reference
  if (out.user && typeof out.user === "object") {
    out.user = { ...out.user, _id: String(out.user._id) };
  }

  // Populated roomFlat reference
  if (out.roomFlat && typeof out.roomFlat === "object") {
    out.roomFlat = { ...out.roomFlat, _id: String(out.roomFlat._id) };
  }

  // Dates → ISO strings
  if (out.createdAt && typeof out.createdAt === "object" && "toISOString" in out.createdAt) {
    out.createdAt = out.createdAt.toISOString();
  }
  if (out.updatedAt && typeof out.updatedAt === "object" && "toISOString" in out.updatedAt) {
    out.updatedAt = out.updatedAt.toISOString();
  }

  return out;
}

/**
 * POST /api/roommates/profile
 * Creates the caller's RoommateProfile. One per user — the schema's
 * `unique: true` on `user` enforces this at the DB level too.
 */
export async function createProfile(req, res) {
  try {
    const existing = await RoommateProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        message: "You already have a roommate profile. Use update instead.",
      });
    }

    // Both request shapes are accepted:
    //  - JSON body (no new photo files)
    //  - Multipart (new photos picked in the wizard): the JSON body arrives
    //    stringified in `payload` while files land in req.files via the
    //    multer-cloudinary middleware on the "photos" field (same pattern as
    //    RoomFlat).
    let body = req.body;
    if (typeof body?.payload === "string") {
      try {
        body = JSON.parse(body.payload);
      } catch {
        // Malformed payload string — fall through with the raw body.
      }
    }

    const uploadedPhotos = (req.files || []).map((file) => file.path);
    const keptPhotos = Array.isArray(body.photos)
      ? body.photos.filter((photo) => typeof photo === "string")
      : [];

    const { type, searchArea, budgetRange, ...profileFields } = body;

    if (!type) {
      return res.status(400).json({ message: "type is required." });
    }

    const isSeeker = type === "no_room";
    if (isSeeker && !searchArea?.city) {
      return res.status(400).json({
        message: "searchArea.city is required for seeker profiles.",
      });
    }

    const profile = await RoommateProfile.create({
      user: req.user._id,
      type,
      searchArea: isSeeker ? normalizeSearchArea(searchArea) : undefined,
      budgetRange: isSeeker ? budgetRange : undefined,
      photos: [...keptPhotos, ...uploadedPhotos],
      ...profileFields,
    });

    // Keep User.roommateProfile in sync so it's a cheap populate later.
    await User.findByIdAndUpdate(req.user._id, {
      roommateProfile: profile._id,
    });

    // Serialize to plain object with string IDs and ISO date strings so the
    // frontend can reliably work with the response (=== against string IDs,
    // no Date objects leaking through).
    return res.status(201).json(serializeProfile(profile));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/roommates/profile
 * Partial update of the caller's own profile. Documents are handled by a
 * separate endpoint (see uploadDocument below) — never accepted here.
 */
export async function updateProfile(req, res) {
  try {
    // Both request shapes are accepted — same dual pattern as RoomFlat:
    //  - JSON body (edits without new photo files)
    //  - Multipart: JSON body stringified in `payload`, new files in
    //    req.files via the multer-cloudinary middleware on "photos".
    let updatableFields = { ...req.body };
    if (typeof req.body?.payload === "string") {
      try {
        updatableFields = JSON.parse(req.body.payload);
      } catch {
        // Malformed payload string — fall through with the raw body.
      }
    }
    delete updatableFields.payload;

    const { documents, user, searchArea, ...rest } = updatableFields; // eslint-disable-line no-unused-vars

    // Newly uploaded photos (Cloudinary URLs from multer) are appended to any
    // kept URLs sent in the body. `photos` in the body (even []) always wins
    // so clearing every photo in edit mode is honored; leaving it out entirely
    // keeps the saved list untouched.
    const uploadedPhotos = (req.files || []).map((file) => file.path);
    const keptPhotos = Array.isArray(rest.photos)
      ? rest.photos.filter((photo) => typeof photo === "string")
      : [];
    const photosProvided = "photos" in rest || uploadedPhotos.length > 0;
    const photos = photosProvided
      ? [...keptPhotos, ...uploadedPhotos]
      : undefined;

    const existing = await RoommateProfile.findOne({ user: req.user._id });
    if (!existing) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // Spread of a Mongoose subdocument keeps values but breaks boolean-vs-doc
    // identity in a few edge cases; converting to a plain object first keeps
    // the merge predictable. Blanks mean "cleared" — drop them so enum
    // validators never see "".
    const savedHabits = existing.habits?.toObject?.() ?? existing.habits ?? {};
    const incomingHabits = rest.habits ?? {};
    const mergedHabits = { ...savedHabits };
    for (const [key, value] of Object.entries(incomingHabits)) {
      if (value === "" || value === null) {
        delete mergedHabits[key];
      } else {
        mergedHabits[key] = value;
      }
    }
    if (rest.habits) {
      rest.habits = mergedHabits;
    }

    const isComplete = Boolean(
      (rest.gender ?? existing.gender) &&
        (rest.occupation ?? existing.occupation) &&
        mergedHabits.smoking &&
        mergedHabits.drinking &&
        mergedHabits.foodPreference &&
        mergedHabits.cleanlinessLevel,
    );

    const update = {
      ...rest,
      ...(photos !== undefined && { photos }),
      ...(searchArea !== undefined && {
        searchArea: normalizeSearchArea(searchArea),
      }),
      isComplete,
    };

    const profile = await RoommateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.json(serializeProfile(profile));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/profile/me
 * The caller's own profile, WITH documents (owner can see their own).
 */
export async function getOwnProfile(req, res) {
  try {
    const profile = await RoommateProfile.findOne({
      user: req.user._id,
    })
      .select("+documents")
      .populate("user", "_id name avatarUrl")
      .populate("roomFlat");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.json(serializeProfile(profile));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/profile/:id
 * Public view of another user's profile — documents never included.
 * Relies on the schema's select: false; no .select('+documents') here.
 */
export async function getPublicProfile(req, res) {
  try {
    const profile = await RoommateProfile.findById(req.params.id)
      .populate("user", "_id name avatarUrl")
      .populate("roomFlat");

    if (!profile || profile.status === "closed") {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.json(serializeProfile(profile));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/roommates/profile/documents
 * Attach a verification document to the caller's own profile. Expects the
 * file to already be uploaded to private storage upstream (e.g. a signed
 * PUT to S3) — this endpoint only records the resulting fileKey, it never
 * accepts or stores raw file bytes itself.
 */
export async function uploadDocument(req, res) {
  try {
    const { type, lastFourDigits, fileKey } = req.body;

    if (!type || !fileKey) {
      return res
        .status(400)
        .json({ message: "type and fileKey are required." });
    }

    const profile = await RoommateProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          documents: {
            type,
            lastFourDigits,
            fileKey,
            verificationStatus: "pending",
          },
        },
      },
      { new: true, select: "+documents" },
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(201).json({ documents: profile.documents });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/seekers
 * Returns all active roommate profiles (both have_room and no_room).
 * Populates user (for name/avatar) and roomFlat (for have_room profiles'
 * location and rent).
 *
 * Query params:
 *   city              – filter by searchArea.city (no_room) or roomFlat.location.city (have_room)
 *   type              – "have_room" | "no_room"
 *   gender            – "male" | "female" | "other" | "prefer_not_to_say"
 *   occupation        – "student" | "working_professional" | "self_employed" | "other"
 *   smoking           – "yes" | "no" (matches habits.smoking)
 *   drinking          – "yes" | "no" (matches habits.drinking)
 *   foodPreference    – "veg" | "non_veg" | "eggetarian" | "vegan" (matches habits.foodPreference)
 *   cleanliness       – "very_tidy" | "moderately_tidy" | "relaxed" (matches habits.cleanlinessLevel)
 *   idVerified        – "true" to show only verified profiles
 *   minBudget         – minimum budget (matches budgetRange.min for no_room, roomFlat.rentAmount for have_room)
 *   maxBudget         – maximum budget
 * Never returns documents (default select: false covers this).
 */
export async function searchSeekers(req, res) {
  try {
    const {
      city,
      type,
      gender,
      occupation,
      smoking,
      drinking,
      foodPreference,
      cleanliness,
      idVerified,
      minBudget,
      maxBudget,
    } = req.query;

    const query = {
      status: "active",
    };

    if (type) query.type = type;
    if (gender) query.gender = gender;
    if (occupation) query.occupation = occupation;
    if (smoking) query["habits.smoking"] = smoking;
    if (drinking) query["habits.drinking"] = drinking;
    if (foodPreference) query["habits.foodPreference"] = foodPreference;
    if (cleanliness) query["habits.cleanlinessLevel"] = cleanliness;
    if (idVerified === "true") query.idVerified = true;

    // City filter: match either searchArea.city (no_room) or roomFlat.location.city (have_room)
    if (city) {
      query.$or = [
        { "searchArea.city": city },
        { "roomFlat.location.city": city },
      ];
    }

    // Budget filter: match budgetRange.max (no_room) or roomFlat.rentAmount (have_room)
    // Each field type needs min+max combined with $and, then $or between field types
    if (minBudget || maxBudget) {
      const min = minBudget ? Number(minBudget) : undefined;
      const max = maxBudget ? Number(maxBudget) : undefined;

      const budgetOr = [];

      // For no_room profiles: budgetRange.max must be within range
      const noRoomAnd = [];
      if (min !== undefined) noRoomAnd.push({ "budgetRange.max": { $gte: min } });
      if (max !== undefined) noRoomAnd.push({ "budgetRange.max": { $lte: max } });
      if (noRoomAnd.length > 0) {
        budgetOr.push(
          noRoomAnd.length === 1
            ? { type: "no_room", ...noRoomAnd[0] }
            : { type: "no_room", $and: noRoomAnd },
        );
      }

      // For have_room profiles: roomFlat.rentAmount must be within range
      const haveRoomAnd = [];
      if (min !== undefined)
        haveRoomAnd.push({ "roomFlat.rentAmount": { $gte: min } });
      if (max !== undefined)
        haveRoomAnd.push({ "roomFlat.rentAmount": { $lte: max } });
      if (haveRoomAnd.length > 0) {
        budgetOr.push(
          haveRoomAnd.length === 1
            ? { type: "have_room", ...haveRoomAnd[0] }
            : { type: "have_room", $and: haveRoomAnd },
        );
      }

      if (budgetOr.length > 0) {
        // Combine with existing $or (city) using $and if needed
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: budgetOr }];
          delete query.$or;
        } else {
          query.$or = budgetOr;
        }
      }
    }

    const seekers = await RoommateProfile.find(query)
      .populate("user", "_id name avatarUrl")
      .populate("roomFlat")
      .limit(50);

    // Attach a match score against the requester's own profile, if they
    // have one — cheap since matchScoreAgainst is a pure in-memory method.
    // Also serialize each profile so populated refs and dates become plain
    // strings the frontend can work with.
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    const withScores = seekers.map((s) => ({
      profile: serializeProfile(s.toObject()),
      matchScore: myProfile ? myProfile.matchScoreAgainst(s) : null,
    }));

    return res.json(withScores);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
