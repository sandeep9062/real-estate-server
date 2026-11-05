// Shared markdown normalizer for Journal content.
//
// Run mongodump (or otherwise back up the journals collection) before
// running any migration that rewrites stored content.
export function normalizeMarkdown(text) {
  if (text === undefined || text === null) return "";
  if (typeof text !== "string") return text;
  const CR = String.fromCharCode(13);
  const LF = String.fromCharCode(10);
  const BS = String.fromCharCode(92);
  const NBSP = String.fromCharCode(160);
  const ZWSP = String.fromCharCode(8203);
  const ZWNJ = String.fromCharCode(8204);
  const ZWJ = String.fromCharCode(8205);
  const BOM = String.fromCharCode(65279);
  let out = text
    .split(CR + LF)
    .join(LF)
    .split(CR)
    .join(LF);
  const singles = ["*", "_", "[", "]"];
  for (const ch of singles) {
    out = out.split(BS + ch).join(ch);
  }
  out = out.split(NBSP).join(" ");
  const zw = [ZWSP, ZWNJ, ZWJ, BOM];
  for (const ch of zw) {
    out = out.split(ch).join("");
  }
  const TRIPLE = LF + LF + LF;
  const DOUBLE = LF + LF;
  let prev = null;
  while (prev !== out) {
    prev = out;
    out = out.split(TRIPLE).join(DOUBLE);
  }
  return out.trim();
}

// Lowercase, replace any non-[a-z0-9] run with "-", trim hyphens.
export function slugify(text) {
  if (text === undefined || text === null) return "";
  const lower = String(text).toLowerCase();
  let out = "";
  let lastDash = false;
  for (const ch of lower) {
    const ok = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    if (ok) {
      out += ch;
      lastDash = false;
    } else if (!lastDash) {
      out += "-";
      lastDash = true;
    }
  }
  while (out.startsWith("-")) out = out.slice(1);
  while (out.endsWith("-")) out = out.slice(0, -1);
  return out;
}

// FormData (multipart) arrives as the strings "true"/"false". Normalize
// explicitly instead of relying on Mongoose casting ("false" is truthy).
export function parseBooleanFlag(value) {
  if (value === undefined || value === null) return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return Boolean(value);
}
