import express from "express";
import { aiStructuredRequest } from "../../utils/aiRequest.js";

const router = express.Router();

/**
 * 内部链接优化接口
 * POST /api/internal-link-optimizer
 *
 * 功能：在Blog内容中自动识别合适位置插入内部链接
 * 目标：提高SEO效果，保证锚文本自然契合，避免重复链接
 */
router.post("/", async (req, res) => {
  console.log("🔗 Internal Link Optimizer - Request:", req.body);
  const MAX_CHANGES = 15;

  try {
    // 输入参数验证
    const { paragraphs, links } = req.body;

    if (!paragraphs || !Array.isArray(paragraphs)) {
      return res.status(400).json({
        error: "paragraphs is required and must be an array",
      });
    }

    if (!links || !Array.isArray(links)) {
      return res.status(400).json({
        error: "links is required and must be an array",
      });
    }

    // 验证paragraphs格式
    for (const [index, paragraph] of paragraphs.entries()) {
      if (
        typeof paragraph.index !== "number" ||
        typeof paragraph.markdown !== "string"
      ) {
        return res.status(400).json({
          error: `Invalid paragraph format at index ${index}. Required: {index: number, markdown: string}`,
        });
      }
    }

    // 验证links格式
    for (const [index, link] of links.entries()) {
      if (
        !link.targetUrl ||
        !link.anchorTexts ||
        !Array.isArray(link.anchorTexts)
      ) {
        return res.status(400).json({
          error: `Invalid link format at index ${index}. Required: {targetUrl: string, anchorTexts: string[]}`,
        });
      }
    }

    // 如果没有链接需要处理，直接返回空结果
    if (links.length === 0) {
      return res.json({ changes: [] });
    }

    // 构建AI提示
    const prompt = `You are an assistant that helps insert internal links into blog content.

### Inputs:
- A list of blog paragraphs, each with an index and Markdown text.
- A list of internal links, each with 1–3 candidate anchor texts.

### Rules:
1. Each link must be inserted exactly once in the article.
2. For each link, choose only one anchor text that best fits the context.
3. Insert the chosen anchor text as a Markdown link in the most relevant paragraph.
4. You may add minimal extra words or slightly adjust sentence structure if needed to make the insertion smooth and natural.
5. Do not change formatting or meaning except for adding links.
6. If a paragraph does not need modification, do not include it in the output.
7. **CRITICAL**: Do NOT modify text that already contains links (Markdown links, HTML links, or any existing hyperlinks).
8. **CRITICAL**: Do NOT replace existing links with new ones.
9. **CRITICAL**: Only add links to plain text that does NOT already have links.
10. **CRITICAL**: The anchor text must be semantically relevant to the target URL.
11. **LIMIT**: Return maximum ${MAX_CHANGES} modifications to avoid response being too long.

### Input Data:

**Paragraphs:**
${paragraphs.map((p) => `Index ${p.index}: ${p.markdown}`).join("\n\n")}

**Links to Insert:**
${links
  .map(
    (link, i) => `Link ${i + 1}: ${link.targetUrl}
Anchor text options: ${link.anchorTexts.join(", ")}`
  )
  .join("\n\n")}

### Important:
- Return "changes": [] if no modifications are made.
- Do not include explanations, notes, or any text outside the JSON.
- Each link should only be used once across all paragraphs.
- Choose the most contextually relevant anchor text for each link.
- The "index" field must be a NUMBER (not string), matching the paragraph index from input.
- **MAXIMUM ${MAX_CHANGES} changes in the response** - prioritize the most relevant matches.
- Keep response concise to avoid JSON parsing errors.

### FORBIDDEN ACTIONS:
- Do NOT touch any existing links: [text](url), <a href="url">text</a>, <u>[text](url)</u>
- Do NOT replace existing hyperlinks
- Do NOT modify text that is already linked
- Do NOT add irrelevant links (e.g., geographic names to unrelated URLs)
- ONLY link plain text that semantically matches the target URL purpose`;

    // 定义输出结构
    const outputSchema = {
      changes: [
        {
          index: "number (not string) - paragraph index from input",
          original: "string - original paragraph text (Markdown)",
          modified:
            "string - modified paragraph text (Markdown, with inserted link)",
        },
      ],
    };

    // 调用AI服务进行内部链接优化
    console.log("🤖 Calling AI service for internal link optimization...");

    let aiResult;
    try {
      aiResult = await aiStructuredRequest(prompt, outputSchema, {
        provider: "openai", // 使用 OpenAI 模型
        model: "gcp-claude-sonnet-4", // 使用 GPT-4o mini 模型
        max_tokens: 10000,
        temperature: 0.3,
        timeout: 60000,
        autoOptimize: false,
      });
      console.log("✅ AI optimization completed:", aiResult);
    } catch (error) {
      console.warn(
        "⚠️ AI service unavailable, using fallback logic:",
        error.message
      );
    }

    // 验证AI返回结果
    if (!aiResult.changes || !Array.isArray(aiResult.changes)) {
      console.warn("⚠️ AI returned invalid format, returning empty changes");
      return res.json({ changes: [] });
    }

    // 验证每个change的格式并转换index类型
    const validChanges = aiResult.changes
      .map((change) => {
        // 将字符串index转换为数字
        const index =
          typeof change.index === "string"
            ? parseInt(change.index, 10)
            : change.index;
        return {
          ...change,
          index: index,
        };
      })
      .filter((change) => {
        return (
          typeof change.index === "number" &&
          !isNaN(change.index) &&
          typeof change.original === "string" &&
          typeof change.modified === "string" &&
          change.original !== change.modified
        );
      })
      .slice(0, MAX_CHANGES); // 确保最多返回15个修改

    console.log(
      `📊 Validation: ${validChanges.length}/${aiResult.changes.length} changes are valid`
    );

    res.json({ changes: validChanges });
  } catch (error) {
    console.error("❌ Internal Link Optimizer Error:", error);
    res.status(500).json({
      error: "Internal server error during link optimization",
      details: error.message,
    });
  }
});

export default router;
