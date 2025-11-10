import StoryblokClient from "storyblok-js-client";
import dotenv from "dotenv";
dotenv.config();

// CDN API 客户端 - 用于读取内容
const StoryblokCDN = new StoryblokClient({
  accessToken: process.env.STORYBLOK_CDN_API_TOKEN,
  cache: {
    clear: "auto",
    type: "memory",
  },
});

// 管理 API 客户端 - 用于创建/更新/发布内容
const StoryblokManagement = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_API_TOKEN,
});

const STORYBLOK_SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const BASE_URL = `spaces/${STORYBLOK_SPACE_ID}/stories/`;

const STORYBLOK_API_URL = "cdn/stories/";

const getStoryByFullSlugCDN = async (full_slug) => {
  try {
    const rs = await StoryblokCDN.get(`${STORYBLOK_API_URL}${full_slug}`, {
      version: "draft",
    });
    return rs.data.story;
  } catch (e) {
    console.log("🚀 ~ getStoryByFullSlugCDN ~ e:", e);
  }
};

const createStoryToStoryblok = async (params) => {
  try {
    // 使用管理 API 创建 story
    const rs = await StoryblokManagement.post(BASE_URL, params);
    return { success: true, data: rs.data };
  } catch (e) {
    console.log("🚀 ~ createStoryToStoryblok ~ e:", e);
    return { success: false, message: e.message };
  }
};

const publishStoryToStoryblok = async (id) => {
  try {
    // 使用管理 API 发布 story
    const rs = await StoryblokManagement.get(`${BASE_URL}${id}/publish`);
    return { success: true, data: rs.data };
  } catch (e) {
    console.log("🚀 ~ publishStoryToStoryblok ~ e:", e);
    return { success: false, message: e.message };
  }
};

export {
  getStoryByFullSlugCDN,
  createStoryToStoryblok,
  publishStoryToStoryblok,
};
