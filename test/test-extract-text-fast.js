import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("📂 Reading HTML file...");
const html = fs.readFileSync(path.join(__dirname, "temp.html"), "utf-8");
console.log(`✅ File loaded: ${(html.length / 1024 / 1024).toFixed(2)} MB\n`);

/**
 * Extract raw text (remove all tags)
 */
function extractRawText(html) {
  let text = html;

  // Remove script tags and their content
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  // Remove style tags and their content
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

  // Remove noscript tags
  text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Remove excessive whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extract semantic text (only from semantic tags)
 */
function extractSemanticText(html) {
  let text = "";

  // Remove script, style, noscript first
  let cleanHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  // Extract content from semantic tags
  const semanticTags = [
    "main",
    "article",
    "section",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
  ];

  const chunks = [];

  semanticTags.forEach((tag) => {
    // Match opening and closing tags with content
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    let match;

    while ((match = regex.exec(cleanHtml)) !== null) {
      let content = match[1];

      // Skip if contains display:none or visibility:hidden (SEO will ignore these)
      // Note: This is a basic check for inline styles only
      // Real SEO bots parse computed styles from CSS, which requires a full DOM parser
      if (
        match[0].includes("display:none") ||
        match[0].includes("display: none") ||
        match[0].includes("visibility:hidden") ||
        match[0].includes("visibility: hidden") ||
        match[0].includes('aria-hidden="true"')
      ) {
        continue;
      }

      // Remove nested HTML tags
      content = content.replace(/<[^>]+>/g, " ");

      // Decode entities
      content = content
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–");

      // Clean whitespace
      content = content.replace(/\s+/g, " ").trim();

      // Only keep chunks with meaningful content (> 30 chars)
      if (content.length > 30) {
        chunks.push(content);
      }
    }
  });

  return chunks.join("\n\n");
}

console.log("🔄 Extracting raw text...");
const rawText = extractRawText(html);
console.log(`✅ Raw text extracted: ${rawText.length} characters\n`);

console.log("🔄 Extracting semantic text...");
const semanticText = extractSemanticText(html);
console.log(`✅ Semantic text extracted: ${semanticText.length} characters\n`);

console.log("========== RAW TEXT ==========");
console.log(`Length: ${rawText.length}`);
console.log(rawText.slice(0, 300));
console.log("\n");

console.log("========== SEMANTIC TEXT ==========");
console.log(`Length: ${semanticText.length}`);
console.log(semanticText.slice(0, 500));
console.log("\n");

console.log("========== COMPARISON ==========");
console.log(
  "Semantic Coverage:",
  semanticText.length && rawText.length
    ? (semanticText.length / rawText.length).toFixed(2)
    : 0
);

// Save results
const outputDir = path.join(__dirname, "output");
fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, "notta-raw-text.txt"), rawText, "utf-8");
fs.writeFileSync(
  path.join(outputDir, "notta-semantic-text.txt"),
  semanticText,
  "utf-8"
);

console.log("\n✅ Results saved to test/output/");
