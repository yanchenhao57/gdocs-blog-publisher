// utils/storyblokApi.js
// Storyblok API 通用方法封装
import StoryblokClient from "storyblok-js-client";
import dotenv from "dotenv";
dotenv.config();

// 初始化 Storyblok 管理客户端
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_API_TOKEN,
});

/**
 * 根据 slug 查询 Storyblok 中的 Story
 * @param {string} slug - 文章 slug
 * @returns {object|null} Story 对象或 null
 */
const getStoryBySlug = async (slug) => {
  try {
    const spaceId = process.env.STORYBLOK_SPACE_ID;
    const res = await Storyblok.get(`spaces/${spaceId}/stories`, {
      filter_query: { slug: { in: slug } },
      per_page: 1,
    });
    const stories = res.data.stories || [];
    return stories.length > 0 ? stories[0] : null;
  } catch (err) {
    console.error("❌ 查询 Storyblok Story 失败:", err.message);
    throw err;
  }
};

/**
 * 创建新的 Story
 * @param {object} payload - Story 数据
 * @returns {object} 创建结果
 */
const createStory = async (payload) => {
  try {
    const spaceId = process.env.STORYBLOK_SPACE_ID;
    const res = await Storyblok.post(`spaces/${spaceId}/stories`, {
      story: payload,
    });
    return res.data;
  } catch (err) {
    console.error("❌ 创建 Storyblok Story 失败:", err.message);
    throw err;
  }
};

/**
 * 更新已存在的 Story
 * @param {number} id - Story 的 ID
 * @param {object} payload - Story 数据
 * @returns {object} 更新结果
 */
const updateStory = async (id, payload) => {
  try {
    const spaceId = process.env.STORYBLOK_SPACE_ID;
    const res = await Storyblok.put(`spaces/${spaceId}/stories/${id}`, {
      story: payload,
    });
    return res.data;
  } catch (err) {
    console.error("❌ 更新 Storyblok Story 失败:", err.message);
    throw err;
  }
};

/**
 * 通过 slug + parent_id 判断是否存在某个 story
 * @param {string} slug
 * @param {number} parentId
 * @returns {Promise<object|null>} 如果存在返回 story 对象，不存在返回 null
 */
async function getStoryBySlugAndParentId(slug, parentId) {
  try {
    const res = await Storyblok.get(
      `spaces/${process.env.STORYBLOK_SPACE_ID}/stories`,
      {
        search_term: slug,
        with_parent_ids: parentId,
        per_page: 1,
      }
    );

    const match = res.data.stories.find(
      (s) => s.slug === slug && s.parent_id === parentId
    );

    return match || null;
  } catch (error) {
    throw error;
  }
}

export { getStoryBySlug, createStory, updateStory, getStoryBySlugAndParentId };
