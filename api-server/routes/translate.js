import express from "express";
import { SCHEMA_MAP, BLO_TEMPLATE_MAP } from "../../constant/schema.js";
import { gptTranslator } from "../utils/gpt-translator.js";
import { PID_MAP } from "../../constant/parentIds.js";
import { ALL_LNG } from "../../constant/language.js";
const router = express.Router();

router.post("/generated", async (req, res) => {
  try {
    const { story, lngInfo } = req.body;

    const {
      group_id: storyGroupId = "",
      content: storyContent = {},
      slug = "",
      full_slug = "",
    } = story;

    const firstPart = full_slug.split("/")[0];

    // 被翻译页面的语言
    const originalLng = ALL_LNG.includes(firstPart) ? firstPart : "";
    const changeStr = full_slug.replace(originalLng, "");

    const componentType = storyContent.component;

    if (!SCHEMA_MAP[componentType]) {
      return res.status(400).json({ error: "不支持的 Story 类型" });
    }

    const schema = SCHEMA_MAP[componentType];
    const blokTemplate = BLO_TEMPLATE_MAP[componentType] || {};

    const translatedStory = await gptTranslator(
      storyContent,
      schema,
      blokTemplate,
      lngInfo
    );

    const translatedStoryArr = [];

    for (const lng of lngInfo) {
      const curLngContent = translatedStory[lng];
      const curLngContentStr = JSON.stringify(curLngContent);

      const curLng = lng.toLowerCase();
      const replacedCurLngContentStr = curLngContentStr
        .replaceAll(
          `https://app.notta.ai/signup?language=${
            originalLng === "" ? "ja" : originalLng
          }&from=official`,
          `https://app.notta.ai/signup?language=${curLng}&from=official`
        )
        .replaceAll(
          `"og_url":"https://www.notta.ai/${full_slug}/"`,
          `"og_url":"https://www.notta.ai/${curLng}/${changeStr}/"`
        )
        .replaceAll(
          `"canonical":"https://www.notta.ai/${full_slug}"`,
          `"canonical":"https://www.notta.ai/${curLng}/${changeStr}/"`
        )
        .replaceAll(
          `"url":"/${full_slug}/"`,
          `"url":"/${curLng}/${changeStr}/"`
        )
        .replaceAll(
          `"cached_url":"/${full_slug}/"`,
          `"cached_url":"/${curLng}/${changeStr}/"`
        );
      const finalCurContent = JSON.parse(replacedCurLngContentStr);

      const newStory = {
        slug: `${slug}`,
        name: `${slug}-${lng.toLowerCase()}`,
        content: {
          ...finalCurContent,
          component: componentType,
        },
        group_id: storyGroupId,
        parent_id: PID_MAP[componentType][lng],
      };

      translatedStoryArr.push({ lng, story: newStory });
    }

    return res.status(200).json({ data: translatedStoryArr });
  } catch (error) {
    console.error("❌ 翻译失败:", error);
    res.status(500).json({ error: "翻译失败" });
  }
});

export default router;
