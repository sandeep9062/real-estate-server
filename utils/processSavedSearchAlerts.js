import Property from "../models/Property.js";
import SavedSearch from "../models/SavedSearch.js";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";
import { buildPropertyFindQuery } from "./propertyFilter.js";

function filtersToQueryStrings(filters) {
  if (!filters || typeof filters !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = String(v);
  }
  return out;
}

export async function processSavedSearchAlerts() {
  const active = await SavedSearch.find({ isActive: true }).lean();
  if (!active.length) return { processed: 0, notified: 0 };

  const frontUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  let notified = 0;

  const sendEmail = async (to, subject, html) => {
    try {
      const mod = await import("./send-email.js");
      const defaultFn = mod.default;
      if (typeof defaultFn === "function") {
        await defaultFn({ to, subject, html });
      }
    } catch (e) {
      console.warn("[saved-search-alerts] Email skipped:", e.message);
    }
  };

  for (const ss of active) {
    const now = new Date();
    const qStrings = filtersToQueryStrings(ss.filters);
    const base = buildPropertyFindQuery(qStrings);
    const since = ss.cursorAt || ss.createdAt || new Date(0);
    base.createdAt = { $gt: since };

    const matches = await Property.find(base)
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    await SavedSearch.updateOne({ _id: ss._id }, { $set: { cursorAt: now } });

    if (!matches.length) continue;

    const user = await User.findById(ss.user).select("email name").lean();
    if (!user) continue;

    const lines = matches
      .slice(0, 10)
      .map((p) => {
        const t = p.title || "Listing";
        const id = p._id.toString();
        return `<li><a href="${frontUrl}/property/${id}">${t}</a> — ₹${p.price?.toLocaleString?.("en-IN") || p.price}</li>`;
      })
      .join("");

    if (ss.notifyInApp) {
      await createNotification({
        userId: ss.user,
        title: "New listings match your saved search",
        message: `${matches.length} new listing(s) match "${ss.name || "My search"}".`,
        type: "success",
        category: "search",
        metadata: {
          savedSearchId: ss._id.toString(),
          propertyIds: matches.map((m) => m._id.toString()),
        },
        actionUrl: `${frontUrl}/properties/chandigarh`,
      });
    }

    if (ss.notifyEmail && user.email) {
      await sendEmail(
        user.email,
        `${matches.length} new listing(s) on PropertyBulbul`,
        `<p>Hi ${user.name || ""},</p>
         <p>New properties match your saved search <strong>${ss.name || "My search"}</strong>:</p>
         <ul>${lines}</ul>
         <p><a href="${frontUrl}/saved-searches">Manage saved searches</a></p>`,
      );
    }

    notified += 1;
  }

  return { processed: active.length, notified };
}
