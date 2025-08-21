import express from "express";
import { publishBlogToStoryblok } from "../../utils/publishBlogToStoryblok.js";
import { getStoryByFullSlugCDN } from "../../utils/storyblokCDNApi.js";
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

// Pre-publish 接口：检测 full_slug 是否已存在
router.post("/pre-publish", async (req, res) => {
  try {
    const { full_slug } = req.body;

    // 验证必填字段
    if (!full_slug) {
      return res.status(400).json({
        error: "full_slug 为必填字段",
      });
    }

    console.log(`🔍 检查 full_slug 是否存在: ${full_slug}`);

    // 检查 Storyblok 中是否已存在该 full_slug
    const existingStory = await getStoryByFullSlugCDN(full_slug);

    const exists = !!existingStory;
    
    console.log(`📊 检查结果: ${exists ? '已存在' : '不存在'}`);
    if (exists) {
      console.log(`   - Story ID: ${existingStory.id}`);
      console.log(`   - Story Name: ${existingStory.name}`);
    }

    res.json({
      exists,
      full_slug,
      story: exists ? {
        id: existingStory.id,
        name: existingStory.name,
        slug: existingStory.slug,
        full_slug: existingStory.full_slug
      } : null
    });

  } catch (err) {
    console.error(`❌ Pre-publish 检查失败:`, err);
    res.status(500).json({ 
      error: err.message,
      exists: false 
    });
  }
});

router.post("/", async (req, res) => {
  try {
    // 打印请求数据大小
    const requestBodyString = JSON.stringify(req.body);
    const requestSizeInBytes = Buffer.byteLength(requestBodyString, "utf8");
    const requestSizeInKB = (requestSizeInBytes / 1024).toFixed(2);
    const requestSizeInMB = (requestSizeInBytes / (1024 * 1024)).toFixed(2);

    console.log(`📊 发布请求数据大小:`);
    console.log(`   - 字节数: ${requestSizeInBytes.toLocaleString()} bytes`);
    console.log(`   - KB: ${requestSizeInKB} KB`);
    console.log(`   - MB: ${requestSizeInMB} MB`);

    // 如果数据太大，给出警告
    if (requestSizeInBytes > 1024 * 1024 * 5) {
      // 5MB
      console.log(`⚠️  警告: 请求数据超过5MB，可能导致请求失败`);
    }

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
    if (!["en", "ja"].includes(language)) {
      return res.status(400).json({
        error: "无效的语言参数（必须是 en 或 ja）",
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

    // 返回简化的响应信息
    const previewLink = `https://app.storyblok.com/#/me/spaces/${SPACE_ID}/stories/0/0/${result.story.id}`;
    
    res.json({
      success: true,
      previewLink,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
