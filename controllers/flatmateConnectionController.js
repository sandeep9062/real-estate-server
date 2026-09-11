import FlatmateConnection from "../models/FlatmateConnection.js";
import RoommateProfile from "../models/RoommateProfile.js";

/**
 * POST /api/roommates/connections
 * body: { toProfileId, roomFlatId?, message? }
 *
 * Snapshots a matchScore at request time so it doesn't silently drift if
 * either profile edits their habits/preferences after the request is sent.
 */
export async function sendConnectionRequest(req, res) {
  try {
    const { toProfileId, roomFlatId, message } = req.body;

    const fromProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!fromProfile) {
      return res
        .status(404)
        .json({ message: "Create a roommate profile first." });
    }
    if (fromProfile._id.equals(toProfileId)) {
      return res.status(400).json({ message: "Can't connect with yourself." });
    }

    const toProfile = await RoommateProfile.findById(toProfileId);
    if (!toProfile) {
      return res.status(404).json({ message: "Target profile not found." });
    }

    const matchScore = fromProfile.matchScoreAgainst(toProfile);

    const connection = await FlatmateConnection.create({
      fromProfile: fromProfile._id,
      toProfile: toProfile._id,
      roomFlat: roomFlatId,
      message,
      matchScore,
    });

    return res.status(201).json(connection);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "You've already sent a request to this profile." });
    }
    return res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/roommates/connections/:id
 * body: { status: "accepted" | "declined" | "withdrawn" }
 *
 * Only the recipient can accept/decline; only the sender can withdraw.
 * Contact info is never returned from this endpoint — the frontend should
 * fetch the counterpart's contact details from a SEPARATE endpoint that
 * checks connection.status === "accepted" before revealing anything.
 */
export async function respondToConnectionRequest(req, res) {
  try {
    const { status } = req.body;
    const allowedTransitions = ["accepted", "declined", "withdrawn"];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    const connection = await FlatmateConnection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    const isRecipient = connection.toProfile.equals(myProfile._id);
    const isSender = connection.fromProfile.equals(myProfile._id);

    if (status === "withdrawn" && !isSender) {
      return res
        .status(403)
        .json({ message: "Only the sender can withdraw a request." });
    }
    if ((status === "accepted" || status === "declined") && !isRecipient) {
      return res
        .status(403)
        .json({ message: "Only the recipient can accept or decline." });
    }

    connection.status = status;
    await connection.save();

    // Serialize the response so populated references become plain objects with
    // string IDs that the frontend can compare with === against string values.
    const serialized = {
      ...connection.toObject(),
      _id: String(connection._id),
      fromProfile:
        typeof connection.fromProfile === "object" && connection.fromProfile !== null
          ? { ...connection.fromProfile.toObject(), _id: String(connection.fromProfile._id) }
          : connection.fromProfile,
      toProfile:
        typeof connection.toProfile === "object" && connection.toProfile !== null
          ? { ...connection.toProfile.toObject(), _id: String(connection.toProfile._id) }
          : connection.toProfile,
      roomFlat:
        typeof connection.roomFlat === "object" && connection.roomFlat !== null
          ? { ...connection.roomFlat.toObject(), _id: String(connection.roomFlat._id) }
          : connection.roomFlat,
      createdAt: connection.createdAt?.toISOString() ?? connection.createdAt,
      updatedAt: connection.updatedAt?.toISOString() ?? connection.updatedAt,
    };

    return res.json(serialized);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/roommates/connections
 * All connection requests involving the caller, either direction.
 */
export async function listMyConnections(req, res) {
  try {
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!myProfile) {
      return res.json([]);
    }

    const connections = await FlatmateConnection.find({
      $or: [{ fromProfile: myProfile._id }, { toProfile: myProfile._id }],
    })
      .populate("fromProfile toProfile roomFlat")
      .sort({ createdAt: -1 })
      .lean();

    // Explicitly serialize populated fields to plain objects with string IDs
    // so the frontend can reliably compare IDs with === against string values.
    const serialized = connections.map((c: Record<string, unknown>) => ({
      ...c,
      _id: String(c._id),
      fromProfile:
        typeof c.fromProfile === "object" && c.fromProfile !== null
          ? { ...c.fromProfile, _id: String(c.fromProfile._id) }
          : c.fromProfile,
      toProfile:
        typeof c.toProfile === "object" && c.toProfile !== null
          ? { ...c.toProfile, _id: String(c.toProfile._id) }
          : c.toProfile,
      roomFlat:
        typeof c.roomFlat === "object" && c.roomFlat !== null
          ? { ...c.roomFlat, _id: String(c.roomFlat._id) }
          : c.roomFlat,
      createdAt: c.createdAt ? c.createdAt.toISOString() : c.createdAt,
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : c.updatedAt,
    }));

    return res.json(serialized);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
