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

    return res.json(connection);
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
      .sort({ createdAt: -1 });

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
