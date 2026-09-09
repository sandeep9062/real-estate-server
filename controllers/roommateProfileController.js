import RoommateProfile from "../models/RoommateProfile.js";
import RoomFlat from "../models/RoomFlat.js";
import User from "../models/User.js";

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

    const { intent, searchArea, budgetRange, ...profileFields } = req.body;

    if (!intent) {
      return res.status(400).json({ message: "intent is required." });
    }

    const needsSearchArea = ["seeking_room", "temporary_seek"].includes(intent);
    if (needsSearchArea && !searchArea?.city) {
      return res.status(400).json({
        message: "searchArea.city is required for seeker intents.",
      });
    }

    const profile = await RoommateProfile.create({
      user: req.user._id,
      intent,
      searchArea: needsSearchArea ? searchArea : undefined,
      budgetRange: needsSearchArea ? budgetRange : undefined,
      ...profileFields,
    });

    // Keep User.roommateProfile in sync so it's a cheap populate later.
    await User.findByIdAndUpdate(req.user._id, {
      roommateProfile: profile._id,
    });

    return res.status(201).json(profile);
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
    const { documents, user, ...updatableFields } = req.body; // eslint-disable-line no-unused-vars

    const profile = await RoommateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updatableFields },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.json(profile);
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
    }).select("+documents");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.json(profile);
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
    const profile = await RoommateProfile.findById(req.params.id);
    if (!profile || profile.status === "closed") {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.json(profile);
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
 * GET /api/roommates/seekers?city=&smoking=&drinking=&foodPreference=
 * For a `has_room` poster browsing seekers near them, filtered by lifestyle
 * tags. Never returns documents (default select: false covers this).
 */
export async function searchSeekers(req, res) {
  try {
    const { city, smoking, drinking, nightlifeFriendly, foodPreference } =
      req.query;

    const query = {
      intent: { $in: ["seeking_room", "temporary_seek"] },
      status: "active",
    };

    if (city) query["searchArea.city"] = city;
    if (smoking)
      query["lookingFor.smoking"] = { $in: [smoking, "no_preference"] };
    if (drinking)
      query["lookingFor.drinking"] = { $in: [drinking, "no_preference"] };
    if (nightlifeFriendly)
      query["lookingFor.nightlifeFriendly"] = {
        $in: [nightlifeFriendly, "no_preference"],
      };
    if (foodPreference)
      query["lookingFor.foodPreference"] = { $in: [foodPreference, "any"] };

    const seekers = await RoommateProfile.find(query).limit(50);

    // Attach a match score against the requester's own profile, if they
    // have one — cheap since matchScoreAgainst is a pure in-memory method.
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    const withScores = seekers.map((s) => ({
      profile: s,
      matchScore: myProfile ? myProfile.matchScoreAgainst(s) : null,
    }));

    return res.json(withScores);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
