import RoomFlat from "../models/RoomFlat.js";
import RoommateProfile from "../models/RoommateProfile.js";
import Property from "../models/Property.js";

const PROPERTY_INTENTS = ["has_room", "swap", "temporary_offer"];

/**
 * POST /api/roommates/room-flat
 * Creates the RoomFlat tied to the caller's RoommateProfile. Only valid
 * when the profile's intent actually implies a property exists.
 */
export async function createRoomFlat(req, res) {
  try {
    const profile = await RoommateProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        message: "Create a roommate profile before listing a room/flat.",
      });
    }
    if (!PROPERTY_INTENTS.includes(profile.intent)) {
      return res.status(400).json({
        message: `intent "${profile.intent}" does not list a property. Only has_room, swap, and temporary_offer do.`,
      });
    }
    if (profile.roomFlat) {
      // One profile = one listing. 409 with the existing document attached so
      // a client that re-POSTs (double-submit, retry after a lost response,
      // re-running onboarding without ?edit=1) can PATCH the existing listing
      // instead of dead-ending on the conflict.
      const existing = await RoomFlat.findById(profile.roomFlat);
      return res.status(409).json({
        message: "This profile already has a room/flat listed.",
        existingRoomFlat: existing ?? null,
        existingRoomFlatId: profile.roomFlat,
      });
    }

    // Both request shapes are accepted:
    //  - JSON body (no new photo files)
    //  - Multipart (new photos picked via PhotosLocationFlat): the JSON body
    //    arrives stringified in `payload` while files land in req.files via
    //    the multer-cloudinary middleware on the "photos" field.
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

    const roomFlat = await RoomFlat.create({
      ...body,
      photos: [...keptPhotos, ...uploadedPhotos],
      roommateProfile: profile._id,
      owner: req.user._id,
      intent: profile.intent, // denormalized — always taken from the profile, never trusted from the body
    });

    profile.roomFlat = roomFlat._id;
    await profile.save();

    return res.status(201).json(roomFlat);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/roommates/room-flat/:id
 * Owner-only update. intent is never editable here — it's fixed at
 * creation from the parent profile; changing it would require closing this
 * listing and creating a new one under a new intent.
 */
export async function updateRoomFlat(req, res) {
  try {
    // Accepts a JSON body or multipart (photos): with files attached the JSON
    // body arrives stringified in `payload` (see createRoomFlat).
    let updatableFields = { ...req.body };
    if (typeof req.body?.payload === "string") {
      try {
        updatableFields = JSON.parse(req.body.payload);
      } catch {
        // Malformed payload string — fall through with the raw body.
      }
    }
    delete updatableFields.payload;
    const { intent, owner, roommateProfile, ...fields } = updatableFields; // eslint-disable-line no-unused-vars

    // Newly uploaded photos (Cloudinary URLs from multer) are appended to any
    // kept URLs sent in the body.
    const uploadedPhotos = (req.files || []).map((file) => file.path);
    if (uploadedPhotos.length) {
      const keptPhotos = Array.isArray(fields.photos)
        ? fields.photos.filter((photo) => typeof photo === "string")
        : [];
      fields.photos = [...keptPhotos, ...uploadedPhotos];
    }

    const roomFlat = await RoomFlat.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: fields },
      { new: true, runValidators: true },
    );

    if (!roomFlat) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.json(roomFlat);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/browse?city=&minRent=&maxRent=&roomType=
 *
 * Public browse for seekers. Merges two sources, as discussed:
 *  1. RoomFlat listings with intent has_room / temporary_offer — these
 *     come with a real RoommateProfile behind them (habits, match score).
 *  2. Plain Property rent listings with allowsSubletting: true — an owner
 *     open to sharing but with no dedicated roommate profile/matching data.
 * Swap listings are deliberately excluded — they have their own endpoint
 * (searchSwapMatches below), since swap needs reciprocal-fit logic, not a
 * plain browse.
 */
export async function browseRoomsAndFlats(req, res) {
  try {
    const { city, minRent, maxRent, roomType } = req.query;

    const roomFlatQuery = {
      intent: { $in: ["has_room", "temporary_offer"] },
      status: "active",
    };
    if (city) roomFlatQuery["location.city"] = city;
    if (roomType) roomFlatQuery.roomType = roomType;
    if (minRent || maxRent) {
      roomFlatQuery.rentAmount = {};
      if (minRent) roomFlatQuery.rentAmount.$gte = Number(minRent);
      if (maxRent) roomFlatQuery.rentAmount.$lte = Number(maxRent);
    }

    const propertyQuery = {
      deal: "Rent",
      allowsSubletting: true,
      isActive: true,
      deletedAt: null,
    };
    if (city) propertyQuery["location.city"] = city;
    if (minRent || maxRent) {
      propertyQuery.price = {};
      if (minRent) propertyQuery.price.$gte = Number(minRent);
      if (maxRent) propertyQuery.price.$lte = Number(maxRent);
    }

    const [roomFlats, sharingProperties] = await Promise.all([
      RoomFlat.find(roomFlatQuery).populate("roommateProfile").limit(50),
      Property.find(propertyQuery).limit(50),
    ]);

    return res.json({
      matchedListings: roomFlats.map((rf) => ({
        source: "room_flat",
        listing: rf,
      })),
      sharingAllowedProperties: sharingProperties.map((p) => ({
        source: "property",
        listing: p,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/swap-matches
 * Reciprocal-fit search: shows the caller's swap listing other swap
 * listings where each side's location plausibly fits the other's desired
 * area. Kept off the general browse endpoint on purpose (see module doc).
 */
export async function searchSwapMatches(req, res) {
  try {
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!myProfile || myProfile.intent !== "swap" || !myProfile.roomFlat) {
      return res.status(400).json({
        message: "You need an active swap listing to search for swap matches.",
      });
    }

    const myRoomFlat = await RoomFlat.findById(myProfile.roomFlat);

    const candidates = await RoomFlat.find({
      intent: "swap",
      status: "active",
      _id: { $ne: myRoomFlat._id },
      "location.city": myRoomFlat.swapDetails?.desiredCity,
    }).populate("roommateProfile");

    // Mutual fit: only keep candidates whose OWN desired city matches
    // where my flat actually is.
    const mutualMatches = candidates.filter(
      (c) => c.swapDetails?.desiredCity === myRoomFlat.location.city,
    );

    return res.json(mutualMatches);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
