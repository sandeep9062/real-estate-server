/**
 * Profile completeness calculator, usable by any profile doc (Agent, Landlord).
 *
 * A field counts as "filled" when:
 *  - arrays have at least one element
 *  - any other value is truthy
 *
 * Returns an integer 0-100.
 */
export function getProfileCompleteness(doc, fields) {
  if (!doc || !fields || fields.length === 0) return 0;

  const filled = fields.filter((f) => {
    const val = doc[f];
    return Array.isArray(val) ? val.length > 0 : Boolean(val);
  });
  return Math.round((filled.length / fields.length) * 100);
}

// Which fields count towards completeness, per role (kept next to the helper
// so backend and any future consumers share one definition).
export const AGENT_PROFILE_FIELDS = [
  "bio",
  "rera",
  "locations",
  "specialisations",
  "avatar",
];

export const LANDLORD_PROFILE_FIELDS = [
  "name",
  "bio",
  "phone",
  "email",
  "locations",
  "propertyTypes",
  "avatar",
  "address",
  "city",
];
