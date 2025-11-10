import express from "express";
import {
  getStoryByFullSlugCDN,
  createStoryToStoryblok,
} from "../../utils/storyblokCDNApi.js";

const router = express.Router();

/**
 * 根据 full_slug 获取 Storyblok 数据
 * GET /api/storyblok/story/:full_slug
 */
router.get("/story/:full_slug", async (req, res) => {
  try {
    const { full_slug } = req.params;

    // 验证参数
    if (!full_slug) {
      return res.status(400).json({
        success: false,
        error: "full_slug 参数是必需的",
      });
    }

    console.log(`🔍 正在获取 Storyblok story: ${full_slug}`);

    // 调用 CDN API 获取数据
    const story = await getStoryByFullSlugCDN(full_slug);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: `未找到 full_slug 为 "${full_slug}" 的 story`,
      });
    }

    console.log(`✅ 成功获取 story: ${story.full_slug}`);

    res.json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    console.error("❌ 获取 Storyblok 数据失败:", error);

    res.status(500).json({
      success: false,
      error: "获取 Storyblok 数据失败",
      details: error.message,
    });
  }
});

/**
 * 批量根据 full_slug 获取 Storyblok 数据
 * POST /api/storyblok/stories
 * Body: { full_slugs: ["slug1", "slug2", ...] }
 */
router.post("/stories", async (req, res) => {
  try {
    const { full_slugs } = req.body;

    // 验证参数
    if (!Array.isArray(full_slugs) || full_slugs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "full_slugs 必须是一个非空数组",
      });
    }

    if (full_slugs.length > 50) {
      return res.status(400).json({
        success: false,
        error: "一次最多可查询 50 个 story",
      });
    }

    console.log(`🔍 正在批量获取 ${full_slugs.length} 个 Storyblok stories`);

    // 并发获取所有 stories
    const promises = full_slugs.map(async (full_slug) => {
      try {
        const story = await getStoryByFullSlugCDN(full_slug);
        return {
          full_slug,
          success: true,
          story,
        };
      } catch (error) {
        return {
          full_slug,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(promises);

    // 分离成功和失败的结果
    const successResults = results.filter((r) => r.success && r.story);
    const failedResults = results.filter((r) => !r.success || !r.story);

    console.log(
      `✅ 成功获取 ${successResults.length} 个, 失败 ${failedResults.length} 个`
    );

    res.json({
      success: true,
      data: {
        total: full_slugs.length,
        success_count: successResults.length,
        failed_count: failedResults.length,
        stories: successResults.map((r) => r.story),
        failed: failedResults.map((r) => ({
          full_slug: r.full_slug,
          error: r.error || "未找到对应的 story",
        })),
      },
    });
  } catch (error) {
    console.error("❌ 批量获取 Storyblok 数据失败:", error);

    res.status(500).json({
      success: false,
      error: "批量获取 Storyblok 数据失败",
      details: error.message,
    });
  }
});

/**
 * 创建或更新 Storyblok 数据
 */
router.post("/upload", async (req, res) => {
  try {
    const rs = await createStoryToStoryblok(req.body);
    console.log("🧢 ~ 创建 story ~ rs:", rs);

    res.json(rs);
  } catch (error) {
    console.error("❌ 上传 Storyblok 数据失败:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * 健康检查接口
 * GET /api/storyblok/health
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Storyblok API 服务正常",
    timestamp: new Date().toISOString(),
  });
});

export default router;
