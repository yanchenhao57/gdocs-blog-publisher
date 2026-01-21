import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract readable text from HTML
 * Removes script, style, noscript tags and HTML tags
 * @param {string} html - Raw HTML string
 * @returns {{textLength: number, paragraphCount: number, previewText: string, fullText: string}}
 */
function extractText(html) {
  if (!html || typeof html !== "string") {
    return {
      textLength: 0,
      paragraphCount: 0,
      previewText: "",
      fullText: "",
    };
  }

  let text = html;

  console.log("========== STEP 1: Original HTML Length ==========");
  console.log(`Total characters: ${text.length}\n`);

  // Remove script tags and their content (including inline scripts)
  const beforeScript = text.length;
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  console.log("========== STEP 2: After removing <script> tags ==========");
  console.log(`Removed ${beforeScript - text.length} characters`);
  console.log(`Remaining: ${text.length} characters\n`);

  // Remove style tags and their content
  const beforeStyle = text.length;
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  console.log("========== STEP 3: After removing <style> tags ==========");
  console.log(`Removed ${beforeStyle - text.length} characters`);
  console.log(`Remaining: ${text.length} characters\n`);

  // Remove noscript tags and their content
  const beforeNoscript = text.length;
  text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
  console.log("========== STEP 4: After removing <noscript> tags ==========");
  console.log(`Removed ${beforeNoscript - text.length} characters`);
  console.log(`Remaining: ${text.length} characters\n`);

  // Remove HTML comments
  const beforeComments = text.length;
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  console.log("========== STEP 5: After removing HTML comments ==========");
  console.log(`Removed ${beforeComments - text.length} characters`);
  console.log(`Remaining: ${text.length} characters\n`);

  // Remove all HTML tags
  const beforeTags = text.length;
  text = text.replace(/<[^>]+>/g, " ");
  console.log("========== STEP 6: After removing all HTML tags ==========");
  console.log(`Removed ${beforeTags - text.length} characters`);
  console.log(`Remaining: ${text.length} characters\n`);

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

  console.log("========== STEP 7: After decoding HTML entities ==========");

  // Remove excessive whitespace
  const beforeWhitespace = text.length;
  text = text.replace(/\s+/g, " ").trim();

  console.log(
    "========== STEP 8: After removing excessive whitespace =========="
  );
  console.log(`Removed ${beforeWhitespace - text.length} characters`);
  console.log(`Final text length: ${text.length} characters\n`);

  // Calculate paragraph count (split by double newlines or sentence boundaries)
  const paragraphs = text.split(/[.!?]\s+/).filter((p) => p.trim().length > 20);
  const paragraphCount = paragraphs.length;

  const textLength = text.length;
  const previewText = text.substring(0, 200);

  return {
    textLength,
    paragraphCount,
    previewText,
    fullText: text,
  };
}

// Main execution
async function main() {
  const htmlPath = "/Users/johnnyyan/Desktop/temp.html";

  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║         SEO Content Inspector - Text Extraction Test          ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  console.log(`Reading file: ${htmlPath}\n`);

  try {
    const html = fs.readFileSync(htmlPath, "utf-8");

    const result = extractText(html);

    console.log("\n");
    console.log(
      "╔════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                        FINAL RESULTS                           ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n"
    );

    console.log("📊 Statistics:");
    console.log(`   - Text Length: ${result.textLength} characters`);
    console.log(`   - Paragraph Count: ${result.paragraphCount}`);
    console.log("");

    console.log("📝 Preview (first 200 characters):");
    console.log("─".repeat(70));
    console.log(result.previewText);
    console.log("─".repeat(70));
    console.log("");

    console.log("📄 Full Extracted Text (first 1000 characters):");
    console.log("─".repeat(70));
    console.log(result.fullText.substring(0, 1000));
    if (result.fullText.length > 1000) {
      console.log(
        "\n... (truncated, total length: " +
          result.fullText.length +
          " characters)"
      );
    }
    console.log("─".repeat(70));
    console.log("");

    // Save full text to output file
    const outputPath = path.join(__dirname, "output", "extracted-text.txt");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, result.fullText, "utf-8");
    console.log(`✅ Full extracted text saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
