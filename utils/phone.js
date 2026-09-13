/**
 * Phone number utilities.
 *
 * User phone numbers are stored in E.164 format WITH the country code,
 * e.g. "+919876543210". A bare local number ("9876543210") is NOT accepted —
 * callers must prompt the user for the country code (the frontend uses
 * react-phone-number-input, which always produces E.164 values).
 */

// E.164: leading "+" followed by country code (no leading zero) and the
// subscriber number — 8 to 15 digits in total after the "+".
export const E164_PHONE_RE = /^\+[1-9]\d{7,14}$/;

/**
 * Normalize a user-supplied phone number into E.164.
 *
 * Accepts values like:
 *   "+919876543210"       already E.164
 *   "+91 98765-43210"     spacing / separators
 *   "919876543210"        country code without the "+"
 *   "0091 98765 43210"    international dialing prefix
 *
 * Returns the normalized string, or null when the value cannot represent a
 * valid E.164 number (e.g. a bare 10-digit local number without a country
 * code, letters, too short, etc.).
 */
export const normalizePhone = (raw) => {
  if (typeof raw !== "string") return null;

  // Strip separators commonly typed by users.
  let value = raw.trim().replace(/[\s\-().]/g, "");

  // "00" international dialing prefix → "+"
  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  // Country code provided without the "+" — add it.
  if (!value.startsWith("+") && /^\d{11,15}$/.test(value)) {
    value = `+${value}`;
  }

  return E164_PHONE_RE.test(value) ? value : null;
};

/**
 * Validate a phone number (normalized or raw). Convenience wrapper.
 */
export const isValidPhone = (raw) => Boolean(normalizePhone(raw));
