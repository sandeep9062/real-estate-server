/**
 * Auto-formats raw journal content with Markdown formatting before saving to database.
 *
 * Rules:
 * - First line → H1 (# ) if no heading symbol present
 * - Known section titles ("The Pros", "The Cons", "Verdict") → H2 (##)
 * - Lines starting with list-item keywords ("Walkability:", "Traffic:", "NOC:", etc.) → bullet (*)
 * - Ensures double newline (\n\n) between headings and following paragraphs
 * - Does NOT double-prefix if formatting already exists
 */

// Section titles that should be auto-converted to H2
const H2_TRIGGER_TITLES = [
  "the pros",
  "the cons",
  "verdict",
  "overview",
  "highlights",
  "key features",
  "pros",
  "cons",
  "location",
  "amenities",
  "why invest",
  "why buy",
  "why choose",
  "conclusion",
  "final thoughts",
  "what we think",
  "pricing",
  "floor plan",
  "specifications",
];

// Keywords that indicate a line should be a bullet point
// (colon at end is typical for these list-item patterns)
const BULLET_TRIGGER_PREFIXES = [
  "walkability",
  "traffic",
  "noc",
  "rera",
  "price",
  "size",
  "area",
  "location",
  "connectivity",
  "proximity",
  "distance",
  "landmark",
  "property tax",
  "maintenance",
  "floor",
  "possession",
  "status",
  "launch",
  "completion",
  "handover",
  "developer",
  "builder",
  "architect",
  "design",
  "unit",
  "configuration",
  "beds",
  "baths",
  "balcony",
  "parking",
  "lift",
  "security",
  "power backup",
];

/**
 * Check if a line already has a Markdown heading prefix.
 */
function hasHeadingPrefix(line) {
  return /^#{1,6}\s/.test(line.trim());
}

/**
 * Check if a line already starts with a bullet symbol (*, -, + or numbered list).
 */
function hasBulletPrefix(line) {
  return /^[\s]*[*\-+]\s/.test(line) || /^[\s]*\d+[.)]\s/.test(line);
}

/**
 * Auto-format raw journal content with proper Markdown.
 *
 * @param {string} content - The raw text content
 * @returns {string} - Formatted Markdown content
 */
function formatJournalContent(content) {
  if (!content || typeof content !== "string") return content;

  const lines = content.split("\n");
  const formattedLines = [];
  let isFirstLine = true;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Preserve empty lines
    if (!trimmed) {
      formattedLines.push(line);
      continue;
    }

    // --- First line → H1 ---
    if (isFirstLine) {
      isFirstLine = false;
      if (!hasHeadingPrefix(trimmed)) {
        line = `# ${trimmed}`;
      }
      formattedLines.push(line);
      continue;
    }

    // --- Skip if already formatted with heading or bullet ---
    if (hasHeadingPrefix(trimmed) || hasBulletPrefix(trimmed)) {
      formattedLines.push(line);
      continue;
    }

    // --- Check for H2 trigger titles ---
    const lowerTrimmed = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
    if (H2_TRIGGER_TITLES.includes(lowerTrimmed)) {
      line = `## ${trimmed}`;
      formattedLines.push(line);
      continue;
    }

    // --- Check for bullet point triggers ---
    const bulletMatch = BULLET_TRIGGER_PREFIXES.find(
      (prefix) =>
        lowerTrimmed.startsWith(prefix) &&
        (trimmed.endsWith(":") || trimmed.endsWith(".")),
    );
    if (bulletMatch) {
      line = `* ${trimmed}`;
      formattedLines.push(line);
      continue;
    }

    // --- Otherwise keep as-is ---
    formattedLines.push(line);
  }

  // --- Step 2: Ensure double newline between headings and following paragraphs ---
  return ensureHeadingSpacing(formattedLines.join("\n"));
}

/**
 * Ensures there is a double newline (\n\n) between every heading and the following paragraph.
 */
function ensureHeadingSpacing(content) {
  // Replace a single newline after a heading (H1-H6) with a double newline
  // This regex matches a heading line followed by one newline (but not two or more)
  return content.replace(/^(#{1,6}\s.+?)\n(?!\n)/gm, "$1\n\n");
}

export default formatJournalContent;
