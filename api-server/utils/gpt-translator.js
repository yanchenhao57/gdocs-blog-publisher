import tiktoken from "tiktoken";
import * as uuid from "uuid";
import { LANGUAGE_INFO } from "../../constant/language.js";
import { aiStructuredRequest } from "../../utils/aiRequest.js";

const MODEL_NAME = process.env.OPEN_AI_MODAL_NAME || "gpt-4o";
const ENCODER = tiktoken.encoding_for_model(MODEL_NAME);
const TEXT_PER_MAX_LEN = 500;

class NotFunctionException extends Error {}

class TranslateItem {
  constructor(translate = {}, raw = "") {
    this.translate = translate;
    this.raw = raw;
  }
}

/**
 * 格式化处理翻译后字符串
 * @param {*} text 原始文本
 * @param {*} translated 译文字符串
 * @returns 格式化完毕的译文字符串
 */
function parseTranslate(text, translated) {
  if (!text.includes("\n")) {
    translated = translated.replace(/\n/g, "");
  }
  return translated
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, " ")
    .replace(/\\\\u/g, "\\u")
    .replace(/\\\\x/g, "\\u00");
}

function genTranslateId() {
  return `need-translate-${uuid.v4()}`;
}

/**
 * 开始翻译
 * @param {*} text 原文
 * @param {*} translateId uuid 用于后续原文和译文匹配
 * @param {*} translateDict 生成的uuid树结构对象
 * @param {*} resultArr 结果 Promise 数组
 * @param {*} lngInfo 多语言类型对象
 * @returns null
 */
async function translate(text, translateId, translateDict, resultArr, lngInfo) {
  try {
    translateDict[translateId] = new TranslateItem({}, text);
    text = text.trim();
    const enc = ENCODER.encode(text);

    if (!enc.length) {
      translateDict[translateId]["translate"] = Object.fromEntries(
        lngInfo.map((key) => [key, ""])
      );
      return;
    } else if (enc.length > 230) {
      console.log(`🦒 文本太长: ${enc.length}`);
    }

    if (text?.length > TEXT_PER_MAX_LEN) {
      console.log(`🦒 ${text} 文本太长!!!`);
    }

    let notFunctionAnswer = null;

    try {
      resultArr.push(
        translateInner(text, translateId, lngInfo, notFunctionAnswer)
      );
    } catch (e) {
      if (e instanceof NotFunctionException) {
        notFunctionAnswer = e.message;
        console.log(
          `😡 翻译失败: ${translateId}, ${enc.length}, ${text}, ${notFunctionAnswer}`
        );
      } else {
        console.error(`❌ 翻译错误: ${translateId}, ${enc.length}, ${text}`);
        console.error(e);
      }
    }
  } catch (e) {
    console.error(e);
    console.log(text.content[0].content);
  }
}

/**
 * 通过 GPT 将字符串翻译为多语言
 * @param {*} text 需要翻译的字符串
 * @param {*} uuid uuid 用于后续携带到结果里
 * @param {*} assistanceAnswer 发生错误的额外查询语句
 * @returns Promise 对象 ，会返回翻译后结果对象
 */
async function translateInner(text, uuid, lngInfo, assistanceAnswer = null) {
  const lngCount = lngInfo.length;
  const msgs = [
    {
      role: "system",
      content:
        "You are a translation expert, proficient in conveying the intended meaning. " +
        "Your current task is to translate sections of the help center documentation " +
        `for a product named Notta into ${lngCount} different languages. ` +
        "The documents you are translating will be used by global users, " +
        "so it's important to maintain the intent and style of the original text, " +
        "while ensuring the translations are accurate and easy to understand. " +
        "Please keep all markdown symbols unchanged and do not translate them." +
        'Note that proprietary names like "Notta", "AI" do not need to be translated. ' +
        "Examples of sentences you will translate include '1. Notta로 온라인 Zoom 회의 필기' (Korean) " +
        "and '1. Transcrire des réunions en ligne sur Zoom avec Notta' (French). " +
        "Once the translations are completed, must return them to the 'translated' function.",
    },
    {
      role: "user",
      content: `Translate the following text into ${lngCount} languages:\n\n\`\`\`\n${text}\n\`\`\`\n\nPlease retain any numbering such as '1. ', '2. ' in the text as is.`,
    },
  ];

  if (assistanceAnswer) {
    msgs.push({
      role: "assistant",
      content: assistanceAnswer,
    });
    msgs.push({
      role: "user",
      content: "But your answer must return to the 'translated' tool.",
    });
  }

  const properties = {};
  lngInfo.forEach((lng) => {
    properties[lng] = {
      type: "string",
      description: `${LANGUAGE_INFO[lng]} translation`,
    };
  });

  const aiResponseSchema = {
    type: "object",
    properties,
    required: lngInfo,
  };

  try {
    const result = await aiStructuredRequest(msgs, aiResponseSchema, {
      temperature: 0.5,
      provider: "openai",
      model: "deepseek-chat",
    });

    if (result) {
      const keys = Object.keys(result);
      if (keys.length > lngCount) {
        console.log(
          `🔥 翻译结果包含的语言数量超过了给定的语言数量: ${[...keys]}`
        );
      } else if (keys.length < lngCount) {
        console.log(
          `🔥 翻译结果包含的语言数量小于给定的语言数量: ${[...keys]}`
        );
      }

      return {
        uuid,
        text,
        data: result,
      };
    } else {
      console.log(`❗️ : ${text} 翻译失败!\n`, result);
    }
  } catch (e) {
    console.log("👹 ~ translateInner ~ e:", e);
  }
}

/**
 * 处理元素节点为 doc（富文本）的情况——将 StoryBlok 的结果处理为 uuid 树
 * @param {*} content 元素节点
 * @param {*} blokTemplate 富文本里 blok 元素可能使用的模板
 * @param {*} translateDict 生成的uuid树结构对象
 * @param {*} resultArr 结果 Promise 数组
 * @returns null
 */
async function walkDoc(
  content,
  blokTemplate,
  translateDict,
  resultArr,
  lngInfo
) {
  switch (content.type) {
    case "text": {
      const uuid = genTranslateId();
      translate(content.text, uuid, translateDict, resultArr, lngInfo);
      content.text = uuid;
      break;
    }
    case "image": {
      const uuid = genTranslateId();
      translate(content.attrs.alt, uuid, translateDict, resultArr, lngInfo);
      content.attrs.alt = uuid;
      break;
    }
    case "blok": {
      const items = content.attrs.body;
      for (const item of items) {
        const template = blokTemplate[item.component];
        walkDict(
          item,
          template,
          blokTemplate,
          translateDict,
          resultArr,
          lngInfo
        );
      }
      break;
    }
    default: {
      if (!content.content) return;
      const contentList = content.content;
      for (const subContent of contentList) {
        walkDoc(subContent, blokTemplate, translateDict, resultArr, lngInfo);
      }
    }
  }
}

/**
 * 处理元素节点为数组的情况——将 StoryBlok 的结果处理为 uuid 树
 * @param {*} content 元素节点
 * @param {*} template 模板数组，这里只取到一个元素，所以不要将多个模板写在一个数组下
 * @param {*} blokTemplate 富文本内容可能用到的 blok 模板
 * @param {*} translateDict 生成的uuid树结构对象
 * @param {*} resultArr 结果 Promise 数组
 */
async function walkList(
  content,
  template,
  blokTemplate,
  translateDict,
  resultArr,
  lngInfo
) {
  const actualTemplate = template[0];
  for (const subContent of content) {
    if (!(subContent instanceof Object)) {
      console.log(
        `💁 未知类型: ${typeof subContent}, ${subContent}, ${actualTemplate}`
      );
    }
    walkDict(
      subContent,
      actualTemplate,
      blokTemplate,
      translateDict,
      resultArr,
      lngInfo
    );
  }
}

/**
 * 处理元素节点是对象的情况——将 StoryBlok 的结果处理为 uuid 树
 * @param {*} content 元素节点
 * @param {*} template 模板对象
 * @param {*} blokTemplate 富文本内容可能用到的 blok 模板
 * @param {*} translateDict 生成的uuid树结构对象
 * @param {*} resultArr 结果 Promise 数组
 */
async function walkDict(
  content,
  template,
  blokTemplate,
  translateDict,
  resultArr,
  lngInfo
) {
  // 遍历模板对象
  for (const [key, value] of Object.entries(template)) {
    if (content[key]) {
      // 数组情况
      if (Array.isArray(value)) {
        walkList(
          content[key],
          value,
          blokTemplate,
          translateDict,
          resultArr,
          lngInfo
        );
      } else if (value instanceof Object) {
        // 对象情况
        walkDict(
          content[key],
          value,
          blokTemplate,
          translateDict,
          resultArr,
          lngInfo
        );
      } else if (typeof value === "string") {
        // 是需要翻译的节点
        if (value.startsWith("str")) {
          const uuid = genTranslateId();
          translate(content[key], uuid, translateDict, resultArr, lngInfo);
          content[key] = uuid;
        } else if (value.startsWith("doc")) {
          // 是富文本
          walkDoc(
            content[key],
            blokTemplate,
            translateDict,
            resultArr,
            lngInfo
          );
        }
      } else {
        console.log(`💁 未知类型: ${typeof value}, ${value}, ${template}`);
      }
    }
  }
}

/**
 * 将 StoryBlok 的结果翻译成多语言版本
 * @param {*} content StoryBlok 的结果对象
 * @param {*} schema 模板对象
 * @param {*} blokTemplate 富文本内容可能用到的 blok 模板
 * @param {*} lngInfo 多语言类型对象
 * @returns 翻译结果对象，种类取决于 lngInfo
 */
export const gptTranslator = async (content, schema, blokTemplate, lngInfo) => {
  // 结果数组，实际上是 Promise 数组，需要执行后才有结果
  const resultArr = [];
  try {
    // 需要构建的 uuid 树，注意这个 uuid 树是一个相对扁平的对象，并不是和 storyBlok 一样层级很深的结构
    const translateDict = {};
    // 开始生成树
    await walkDict(
      content,
      schema,
      blokTemplate,
      translateDict,
      resultArr,
      lngInfo
    );
    // 真正的结果数组
    const translateResArr = await Promise.allSettled(resultArr);
    // 遍历结果数组，将翻译成功的结果通过 uuid 查找应用到 uuid 树上，这里应用完之后，这颗树上就有了翻译结果
    translateResArr.forEach((item) => {
      if (!item.value) return;
      const uuid = item?.value?.uuid;
      const data = item?.value?.data;
      translateDict[uuid].translate = data;
    });
    // 合并结果后的多语言对象
    const gptTranslatedAllLanguageRes = {};
    // 依次处理每种语言
    for (const lng of lngInfo) {
      // 先将原文转为字符串
      let contentStr = JSON.stringify(content);
      // 遍历 uuid 树的节点，将原文和译文通过 uuid 匹配，然后替换字符串，得到翻译后的 storyBlok 结果
      for (const uuidKey of Object.keys(translateDict)) {
        // 将 uuid 替换为译文
        contentStr = contentStr.replaceAll(
          uuidKey,
          parseTranslate(
            translateDict?.[uuidKey]?.raw,
            translateDict?.[uuidKey]?.translate?.[lng] ||
              translateDict?.[uuidKey]?.raw ||
              "not translate"
          )
        );
      }
      gptTranslatedAllLanguageRes[lng] = JSON.parse(contentStr);
    }

    console.log("🎉 结果组装成功 ------");
    return gptTranslatedAllLanguageRes;
  } catch (e) {
    console.error("❌ 翻译失败:", e);
  }
};
