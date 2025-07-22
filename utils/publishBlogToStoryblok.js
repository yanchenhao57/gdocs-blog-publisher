import { getStoryBySlug, createStory, updateStory } from "./storyblokApi.js";
import { getStoryByFullSlugCDN } from "./storyblokCDNApi.js";
import "dotenv";

/**
 * 创建或更新 blog_en 类型文章到 Storyblok
 * 先判断是否存在，存在则更新，不存在则创建
 * @param {object} blogData - Blog 内容结构
 */
export async function publishBlogToStoryblok(blogData) {
  const {
    slug,
    seo_title,
    seo_description,
    heading_h1,
    body,
    coverUrl,
    coverAlt,
    date,
    canonical,
    author_id,
    reading_time = "3",
    parent_id,
    component,
    is_show_newsletter_dialog,
    slug_prefix,
  } = blogData;

  const payload = {
    name: heading_h1,
    slug,
    parent_id,
    content: {
      component,
      title: seo_title,
      description: seo_description,
      heading_h1,
      body,
      cover: {
        filename: coverUrl,
        alt: coverAlt,
        title: "",
        copyright: "",
        fieldtype: "asset",
        is_external_url: true,
      },
      date,
      canonical,
      author_id,
      reading_time,
      is_show_newsletter_dialog,
    },
  };

  try {
    // 先查询 story 是否已存在
    const fullSlug = `${slug_prefix}${slug}`;
    const exist = await getStoryByFullSlugCDN(fullSlug);
    if (exist) {
      // 已存在则更新
      console.log(`⚠️ story 已存在，执行更新: ${fullSlug}`);
      const updateRes = await updateStory(exist.id, payload);
      console.log("🚀 ~ publishBlogToStoryblok ~ updateRes:", updateRes);
      console.log(`✅ 已更新: ${exist.full_slug}`);
      return updateRes;
    } else {
      // 不存在则创建
      console.log(`🆕 story 不存在，执行创建: ${fullSlug}`);
      const res = await createStory(payload);
      console.log(`✅ 已创建: ${res.story.full_slug}`);
      return res;
    }
  } catch (err) {
    if (err.response?.data) {
      console.error("❌ API 错误:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("❌ 请求失败:", err.message);
    }
    throw err;
  }
}
