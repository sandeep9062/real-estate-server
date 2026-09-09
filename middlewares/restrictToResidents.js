/**
 * restrictToResidents
 *
 * The roommate-matching feature only makes sense when the profile behind
 * it is a real person who will actually live there — an agent or builder
 * can't honestly answer "do you smoke" or "how tidy are you" on someone
 * else's behalf. Gate profile/room-flat creation to individual users and
 * landlords only.
 *
 * This does NOT stop an agent from registering a `landlord`/`user` account
 * to get around it — that's a data-integrity problem handled separately
 * (see the volume/duplicate-listing heuristics on Property.js and the
 * `unique: true` on RoommateProfile.user, which caps one profile per
 * account).
 */
const ALLOWED_ROLES = ["user", "landlord"];

export function restrictToResidents(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!ALLOWED_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      message:
        "The roommate feature is for individual residents and owners only. Agents and builders can't create a roommate profile.",
    });
  }

  return next();
}
