import RoomFlat from "../models/RoomFlat.js";
import RoommateProfile from "../models/RoommateProfile.js";
import Property from "../models/Property.js";

/**
 * POST /api/roommates/room-flat
 * Creates the RoomFlat tied to the caller's RoommateProfile. Only valid
 * when the profile's type is "have_room".
 */
export async function createRoomFlat(req, res) {
  try {
    const profile = await RoommateProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        message: "Create a roommate profile before listing a room/flat.",
      });
    }
    if (profile.type !== "have_room") {
      return res.status(400).json({
        message: `type "${profile.type}" does not list a property. Only "have_room" does.`,
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
 * Owner-only update.
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
    const { owner, roommateProfile, ...fields } = updatableFields; // eslint-disable-line no-unused-vars

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
 *  1. RoomFlat listings — these come with a real RoommateProfile behind
 *     them (habits, match score).
 *  2. Plain Property rent listings with allowsSubletting: true — an owner
 *     open to sharing but with no dedicated roommate profile/matching data.
 */
export async function browseRoomsAndFlats(req, res) {
  try {
    const { city, minRent, maxRent, roomType } = req.query;

    const roomFlatQuery = {
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
    if (!myProfile || myProfile.type !== "have_room" || !myProfile.roomFlat) {
      return res.status(400).json({
        message: "You need an active room listing to search for swap matches.",
      });
    }

    const myRoomFlat = await RoomFlat.findById(myProfile.roomFlat);
    if (!myRoomFlat.openToSwap) {
      return res.status(400).json({
        message: "Enable openToSwap on your listing to search for swap matches.",
      });
    }

    const candidates = await RoomFlat.find({
      openToSwap: true,
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
