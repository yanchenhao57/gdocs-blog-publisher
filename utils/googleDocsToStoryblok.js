/**
 * Google Docs 到 Storyblok Richtext 转换器
 * 支持完整的嵌套结构、样式和格式
 * 支持图片上传到自定义服务器
 */

class GoogleDocsToStoryblokConverter {
  /**
   * 构造函数
   * @param {Function} imageUploader - 可选，图片上传函数
   */
  constructor(imageUploader) {
    this.lists = new Map(); // 存储列表信息
    this.namedStyles = new Map(); // 存储命名样式
    this.documentStyle = null; // 文档样式
    this.inlineObjects = {};
    this.imageUploader = imageUploader; // 可选的图片上传函数
  }

  /**
   * 主转换函数
   * @param {Object} docJson - Google Docs API 返回的文档JSON
   * @returns {Promise<Object>} Storyblok Richtext 格式的JSON
   */
  async googleDocJsonToRichtext(docJson) {
    // 初始化样式和列表信息
    this.initializeStyles(docJson);
    this.initializeLists(docJson);
    this.initializeInlineObjects(docJson);

    const content = [];

    if (docJson.body && docJson.body.content) {
      for (const element of docJson.body.content) {
        const converted = await this.convertElement(element);
        if (converted) {
          if (Array.isArray(converted)) {
            content.push(...converted);
          } else {
            content.push(converted);
          }
        }
      }
    }

    return {
      type: "doc",
      content: content,
    };
  }

  /**
   * 初始化样式信息
   */
  initializeStyles(docJson) {
    // 处理命名样式
    if (docJson.namedStyles && docJson.namedStyles.styles) {
      for (const style of docJson.namedStyles.styles) {
        this.namedStyles.set(style.namedStyleType, style);
      }
    }

    // 处理文档样式
    if (docJson.documentStyle) {
      this.documentStyle = docJson.documentStyle;
    }
  }

  /**
   * 初始化内联对象信息
   */
  initializeInlineObjects(docJson) {
    this.inlineObjects = docJson.inlineObjects || {};
  }

  /**
   * 初始化列表信息
   */
  initializeLists(docJson) {
    if (docJson.lists) {
      for (const [listId, listData] of Object.entries(docJson.lists)) {
        this.lists.set(listId, listData);
      }
    }
  }

  /**
   * 转换单个元素
   * @param {Object} element - 元素对象
   * @returns {Promise<Object|null>} 转换后的元素对象
   */
  async convertElement(element) {
    if (element.paragraph) {
      return await this.convertParagraph(element.paragraph);
    } else if (element.table) {
      return await this.convertTable(element.table);
    } else if (element.sectionBreak) {
      return null; // 忽略分节符
    }

    return null;
  }

  /**
   * 转换段落
   * @param {Object} paragraph - 段落对象
   * @returns {Promise<Object>} 转换后的段落对象
   */
  async convertParagraph(paragraph) {
    // 检查是否是列表项
    if (paragraph.bullet) {
      return await this.convertListItem(paragraph);
    }

    // 获取段落样式
    const paragraphStyle = this.getParagraphStyle(paragraph);
    const headingLevel = this.getHeadingLevel(paragraphStyle);

    // 转换段落内容
    const content = await this.convertParagraphElements(
      paragraph.elements || []
    );

    if (headingLevel) {
      // 如果是 H2，添加锚点块
      // 获取标题文本
      const headingText = content.map((item) => item.text).join("");

      if (headingLevel === 2 && headingText.trim() !== "") {
        return [
          {
            type: "blok",
            attrs: {
              body: [
                {
                  component: "anchor",
                  description: headingText,
                },
              ],
            },
          },
          {
            type: "heading",
            attrs: {
              level: headingLevel,
            },
            content: content,
          },
        ];
      }

      return {
        type: "heading",
        attrs: {
          level: headingLevel,
        },
        content: content,
      };
    }

    return {
      type: "paragraph",
      content: content,
    };
  }

  /**
   * 转换列表项
   * @param {Object} paragraph - 段落对象
   * @returns {Promise<Object>} 转换后的列表项对象
   */
  async convertListItem(paragraph) {
    const bullet = paragraph.bullet;
    const listId = bullet.listId;
    const nestingLevel = bullet.nestingLevel || 0;

    // 获取列表信息
    const listData = this.lists.get(listId);
    if (!listData) {
      // 如果没有列表信息，默认为无序列表
      return await this.createListStructure(
        "bullet_list",
        nestingLevel,
        paragraph
      );
    }

    // 确定列表类型
    const nestingProperties =
      listData.listProperties?.nestingLevels?.[nestingLevel];
    const glyphType = nestingProperties?.glyphType;

    let listType = "bullet_list";
    if (
      glyphType &&
      (glyphType.includes("DECIMAL") ||
        glyphType.includes("ALPHA") ||
        glyphType.includes("ROMAN"))
    ) {
      listType = "ordered_list";
    }

    return await this.createListStructure(listType, nestingLevel, paragraph);
  }

  /**
   * 创建嵌套列表结构
   * @param {string} listType - 列表类型
   * @param {number} nestingLevel - 嵌套级别
   * @param {Object} paragraph - 段落对象
   * @returns {Promise<Object>} 嵌套列表结构
   */
  async createListStructure(listType, nestingLevel, paragraph) {
    const content = await this.convertParagraphElements(
      paragraph.elements || []
    );

    let listItem = {
      type: "list_item",
      content: [
        {
          type: "paragraph",
          content: content,
        },
      ],
    };

    // 为嵌套创建多层列表结构
    for (let i = nestingLevel; i >= 0; i--) {
      listItem = {
        type: listType,
        content: [listItem],
      };
    }

    return listItem;
  }

  /**
   * 转换表格为自定义blok结构，包含CSS样式和HTML表格
   * @param {Object} table - 表格对象
   * @returns {Promise<Object>} 转换后的表格对象
   */
  async convertTable(table) {
    // 提取所有行和单元格内容
    const rows = [];
    if (table.tableRows) {
      for (const row of table.tableRows) {
        const cells = [];
        if (row.tableCells) {
          for (const cell of row.tableCells) {
            let cellText = "";
            if (cell.content) {
              for (const element of cell.content) {
                const converted = await this.convertElement(element);
                if (converted) {
                  // 只提取纯文本内容
                  if (Array.isArray(converted)) {
                    cellText += converted
                      .map((c) => this.extractTextFromNode(c))
                      .join("");
                  } else {
                    cellText += this.extractTextFromNode(converted);
                  }
                }
              }
            }
            cells.push(cellText.trim());
          }
        }
        rows.push(cells);
      }
    }

    // CSS样式
    const cssStyles = `
                      <style>
                        .styled-table {
                          border-collapse: collapse;
                          margin: 25px 0;
                          font-size: 0.9em;
                          min-width: 400px;
                          border-radius: 5px 5px 0 0;
                          overflow: hidden;
                          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
                        }
                        .styled-table thead tr {
                          background-color: #4e81e9;
                          color: #ffffff;
                          text-align: left;
                          font-weight: bold;
                        }
                        .styled-table th,
                        .styled-table td {
                          padding: 12px 15px;
                        }
                        .styled-table tbody tr {
                          border-bottom: 1px solid #dddddd;
                        }
                        .styled-table tbody tr:nth-of-type(even) {
                          background-color: #f3f3f3;
                        }
                        .styled-table tbody tr:last-of-type {
                          border-bottom: 2px solid #4e81e9;
                        }
                        .styled-table {
                          border-collapse: collapse;
                          margin: 25px 0;
                          font-size: 0.9em;
                          font-family: Noto Sans JP;
                          min-width: 400px;
                          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
                        }
                      </style>`;

    // 组装HTML表格
    let htmlTable = '<table class="styled-table" style="margin: 0 auto">';
    if (rows.length > 0) {
      // 表头
      htmlTable += "<thead><tr>";
      for (const cell of rows[0]) {
        htmlTable += `<th>${cell}</th>`;
      }
      htmlTable += "</tr></thead>";
      // 表体
      htmlTable += "<tbody>";
      for (let i = 1; i < rows.length; i++) {
        htmlTable += "<tr>";
        for (const cell of rows[i]) {
          htmlTable += `<td>${cell}</td>`;
        }
        htmlTable += "</tr>";
      }
      htmlTable += "</tbody>";
    }
    htmlTable += "</table>";

    // 拼接完整的code内容（CSS + HTML）
    const code = cssStyles + htmlTable;

    // 返回Storyblok自定义blok格式
    return {
      type: "blok",
      attrs: {
        body: [
          {
            code: code,
            component: "video embed code",
          },
        ],
      },
    };
  }

  /**
   * 辅助函数：递归提取节点中的纯文本
   */
  extractTextFromNode(node) {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (node.type === "text") return node.text || "";
    if (Array.isArray(node.content)) {
      return node.content
        .map((child) => this.extractTextFromNode(child))
        .join("");
    }
    return "";
  }

  /**
   * 转换段落元素
   * @param {Array} elements - 段落元素数组
   * @returns {Promise<Array>} 转换后的内容数组
   */
  async convertParagraphElements(elements) {
    const content = [];

    for (const element of elements) {
      if (element.textRun) {
        const converted = this.convertTextRun(element.textRun);
        if (converted) {
          content.push(converted);
        }
      } else if (element.inlineObjectElement) {
        const converted = await this.convertInlineObject(
          element.inlineObjectElement
        );
        if (converted) {
          content.push(converted);
        }
      }
    }

    return content;
  }

  /**
   * 转换文本运行
   */
  convertTextRun(textRun) {
    const text = textRun.content || "";
    if (!text) return null;

    const marks = this.getTextMarks(textRun.textStyle);

    return {
      type: "text",
      text: text,
      marks: marks,
    };
  }

  /**
   * 转换内联对象（主要是图片）
   * @param {Object} inlineObject - 内联对象元素
   * @returns {Promise<Object|null>} 转换后的图片对象
   */
  async convertInlineObject(inlineObject) {
    const objectId = inlineObject.inlineObjectId;
    const inlineObjectData = this.inlineObjects?.[objectId];

    if (
      inlineObjectData?.inlineObjectProperties?.embeddedObject?.imageProperties
    ) {
      const embeddedObject =
        inlineObjectData.inlineObjectProperties.embeddedObject;

      const imageProps = embeddedObject.imageProperties;
      const originalSrc = imageProps.contentUri || "";
      const alt = embeddedObject.description || embeddedObject.title || "";

      // 如果提供了图片上传函数，则上传图片到自己的服务器
      let finalSrc = originalSrc;
      if (
        this.imageUploader &&
        typeof this.imageUploader === "function" &&
        originalSrc
      ) {
        try {
          console.log("🔼 开始上传图片:", originalSrc, "alt:", alt);
          finalSrc = await this.imageUploader(originalSrc, alt);
          console.log("✅ 图片上传成功:", finalSrc);
        } catch (error) {
          console.error("❌ 图片上传失败:", error);
          // 如果上传失败，保持原始URL
          finalSrc = originalSrc;
        }
      }

      return {
        type: "image",
        attrs: {
          src: finalSrc,
          alt: alt,
          title: embeddedObject.title || "",
          caption: embeddedObject.description || "",
        },
      };
    }

    return null;
  }

  /**
   * 获取文本标记（粗体、斜体等）
   */
  getTextMarks(textStyle) {
    const marks = [];

    if (!textStyle) return marks;

    // 粗体
    if (textStyle.bold) {
      marks.push({ type: "bold" });
    }

    // 斜体
    if (textStyle.italic) {
      marks.push({ type: "italic" });
    }

    // 下划线
    if (textStyle.underline) {
      marks.push({ type: "underline" });
    }

    // 删除线
    if (textStyle.strikethrough) {
      marks.push({ type: "strike" });
    }

    // 链接
    if (textStyle.link) {
      const url = textStyle.link.url;
      const linkAttrs = {
        href: url,
        target: "_blank",
      };
      
      // 检查是否为外链（非 notta.ai 域名）
      if (this.isExternalLink(url)) {
        linkAttrs.rel = "nofollow noreferrer";
      }
      
      marks.push({
        type: "link",
        attrs: linkAttrs,
      });
    }

    // 文本颜色
    if (textStyle.foregroundColor) {
      const color = this.convertColor(textStyle.foregroundColor);
      if (color) {
        marks.push({
          type: "textStyle",
          attrs: {
            color: color,
          },
        });
      }
    }

    // 背景色
    if (textStyle.backgroundColor) {
      const bgColor = this.convertColor(textStyle.backgroundColor);
      if (bgColor) {
        marks.push({
          type: "highlight",
          attrs: {
            color: bgColor,
          },
        });
      }
    }

    return marks;
  }

  /**
   * 判断是否为外链（非 notta.ai 域名）
   * @param {string} url - 链接URL
   * @returns {boolean} 是否为外链
   */
  isExternalLink(url) {
    if (!url) return false;
    
    try {
      // 处理相对链接，视为内链
      if (url.startsWith('/') || url.startsWith('#') || !url.includes('://')) {
        return false;
      }
      
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // 检查是否为 notta.ai 或其子域名
      return !hostname.endsWith('notta.ai');
    } catch (error) {
      // 如果URL格式错误，默认视为外链以保证安全
      console.warn('Invalid URL format:', url);
      return true;
    }
  }

  /**
   * 转换颜色格式
   */
  convertColor(colorObj) {
    if (colorObj.color) {
      const color = colorObj.color;
      if (color.rgbColor) {
        const r = Math.round((color.rgbColor.red || 0) * 255);
        const g = Math.round((color.rgbColor.green || 0) * 255);
        const b = Math.round((color.rgbColor.blue || 0) * 255);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return null;
  }

  /**
   * 获取段落样式
   */
  getParagraphStyle(paragraph) {
    let style = {};

    // 合并命名样式
    if (paragraph.paragraphStyle?.namedStyleType) {
      const namedStyle = this.namedStyles.get(
        paragraph.paragraphStyle.namedStyleType
      );
      if (namedStyle?.paragraphStyle) {
        style = { ...style, ...namedStyle.paragraphStyle };
      }
    }

    // 合并直接样式
    if (paragraph.paragraphStyle) {
      style = { ...style, ...paragraph.paragraphStyle };
    }

    return style;
  }

  /**
   * 获取标题级别
   */
  getHeadingLevel(paragraphStyle) {
    if (paragraphStyle.namedStyleType) {
      const match = paragraphStyle.namedStyleType.match(/HEADING_(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return null;
  }
}

/**
 * 辅助函数：合并相邻的列表项
 */
function mergeAdjacentLists(content) {
  const merged = [];
  let currentList = null;

  for (const item of content) {
    if (
      (item.type === "bullet_list" || item.type === "ordered_list") &&
      currentList &&
      currentList.type === item.type
    ) {
      // 合并到当前列表
      currentList.content.push(...item.content);
    } else {
      if (currentList) {
        merged.push(currentList);
      }
      if (item.type === "bullet_list" || item.type === "ordered_list") {
        currentList = item;
      } else {
        currentList = null;
        merged.push(item);
      }
    }
  }

  if (currentList) {
    merged.push(currentList);
  }

  return merged;
}

/**
 * 使用示例
 * @param {Object} docJson - Google Docs API 返回的文档JSON
 * @param {Function} imageUploader - 图片上传函数（可选）
 * @returns {Promise<Object>} Storyblok Richtext 格式的JSON
 */
async function convertGoogleDocsToStoryblok(docJson, imageUploader) {
  const converter = new GoogleDocsToStoryblokConverter(imageUploader);
  const result = await converter.googleDocJsonToRichtext(docJson);

  // 合并相邻的列表
  result.content = mergeAdjacentLists(result.content);

  return result;
}

// 末尾导出部分：
export { GoogleDocsToStoryblokConverter, convertGoogleDocsToStoryblok };
