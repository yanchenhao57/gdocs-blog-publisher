import StoryblokClient from "storyblok-js-client";
import dotenv from "dotenv";
dotenv.config();

const StoryblokCDN = new StoryblokClient({
  accessToken: process.env.STORYBLOK_CDN_API_TOKEN,
  cache: {
    clear: "auto",
    type: "memory",
  },
});

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

export { getStoryByFullSlugCDN };
