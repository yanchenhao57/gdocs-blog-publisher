import express from "express";
import { publishBlogToStoryblok } from "../../utils/publishBlogToStoryblok.js";
import {
  BLOG_JP_PARENT_ID,
  BLOG_EN_PARENT_ID,
} from "../../constant/parentIds.js";
import {
  BLOG_JP_COMPONENT_TYPE,
  BLOG_EN_COMPONENT_TYPE,
} from "../../constant/componentType.js";
import {
  BLOG_JP_SLUG_PREFIX,
  BLOG_EN_SLUG_PREFIX,
} from "../../constant/slugPrefix.js";

const router = express.Router();

// Storyblok 空间ID
const SPACE_ID = "159374";

router.post("/", async (req, res) => {
  try {
    const {
      seo_title,
      seo_description,
      heading_h1,
      slug,
      body,
      coverUrl,
      coverAlt,
      date,
      canonical,
      author_id,
      reading_time,
      language,
      is_show_newsletter_dialog,
    } = req.body;

    // 验证必填字段
    if (!slug || !body || !seo_description || !heading_h1 || !seo_title) {
      return res.status(400).json({
        error: "slug、正文、SEO描述、标题和SEO标题为必填字段",
      });
    }

    // 验证语言参数
    if (!["en", "jp"].includes(language)) {
      return res.status(400).json({
        error: "无效的语言参数（必须是 en 或 jp）",
      });
    }

    // 根据语言设置对应的常量
    const parent_id = language === "en" ? BLOG_EN_PARENT_ID : BLOG_JP_PARENT_ID;
    const component =
      language === "en" ? BLOG_EN_COMPONENT_TYPE : BLOG_JP_COMPONENT_TYPE;
    const slug_prefix =
      language === "en" ? BLOG_EN_SLUG_PREFIX : BLOG_JP_SLUG_PREFIX;

    // 组装 blogData
    const blogData = {
      slug,
      seo_title,
      seo_description,
      heading_h1,
      body,
      coverUrl,
      coverAlt, // 添加 coverAlt
      date,
      description: seo_description, // 使用 seo_description 作为描述
      canonical,
      author_id,
      reading_time,
      parent_id,
      is_show_newsletter_dialog,
      component,
      slug_prefix,
    };

    const result = await publishBlogToStoryblok(blogData);

    // 返回更多的 Storyblok 相关信息
    res.json({
      success: true,
      slug,
      spaceId: SPACE_ID,
      storyId: result.story.id,
      fullSlug: `${slug_prefix}${slug}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
