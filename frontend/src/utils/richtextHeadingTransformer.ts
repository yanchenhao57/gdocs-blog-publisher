/**
 * Richtext 标题节点转换工具
 *
 * 根据 special_headings 开关，在前端动态将 richtext 中的标题节点
 * 转换为 special_h2 / special_h3 blok，或还原为普通 heading。
 *
 * 背景：后端生成 richtext 时已按默认配置（h2: true, h3: false）处理。
 * 用户在编辑页修改开关后，此函数负责重新应用转换，使预览和发布内容保持一致。
 */

import type { SpecialHeadings } from "../stores/conversionStore";

type RichtextNode = Record<string, unknown>;

function generateUid(): string {
  return `i-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function extractTextFromNode(node: RichtextNode): string {
  if (node.type === "text") return (node.text as string) || "";
  if (Array.isArray(node.content)) {
    return (node.content as RichtextNode[]).map(extractTextFromNode).join("");
  }
  return "";
}

function isSpecialH2Blok(node: RichtextNode): boolean {
  if (node.type !== "blok") return false;
  const attrs = node.attrs as Record<string, unknown> | undefined;
  const body = attrs?.body as RichtextNode[] | undefined;
  return (
    Array.isArray(body) &&
    body.some((b) => b.component === "special_h2")
  );
}

function isSpecialH3Blok(node: RichtextNode): boolean {
  if (node.type !== "blok") return false;
  const attrs = node.attrs as Record<string, unknown> | undefined;
  const body = attrs?.body as RichtextNode[] | undefined;
  return (
    Array.isArray(body) &&
    body.some((b) => b.component === "special_h3")
  );
}

function isAnchorOnlyBlok(node: RichtextNode): boolean {
  if (node.type !== "blok") return false;
  const attrs = node.attrs as Record<string, unknown> | undefined;
  const body = attrs?.body as RichtextNode[] | undefined;
  return (
    Array.isArray(body) &&
    body.length === 1 &&
    body[0].component === "anchor"
  );
}

function buildSpecialH2Blok(text: string): RichtextNode {
  return {
    type: "blok",
    attrs: {
      id: generateUid(),
      body: [
        { _uid: generateUid(), component: "anchor", description: text },
        { _uid: generateUid(), text, component: "special_h2" },
      ],
    },
  };
}

function buildSpecialH3Blok(text: string, order: number): RichtextNode {
  return {
    type: "blok",
    attrs: {
      id: generateUid(),
      body: [
        {
          _uid: generateUid(),
          text,
          order: String(order),
          component: "special_h3",
        },
      ],
    },
  };
}

/**
 * 根据 specialHeadings 开关，对 richtext content 数组重新处理标题节点。
 * 返回新的 content 数组（不修改原始数据）。
 */
export function applySpecialHeadings(
  richtext: { type: string; content: RichtextNode[] },
  specialHeadings: SpecialHeadings
): { type: string; content: RichtextNode[] } {
  if (!richtext?.content) return richtext;

  const nodes = richtext.content;
  const result: RichtextNode[] = [];
  let h3Counter = 0;
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i];

    // --- H2 处理（每次遇到 H2 都重置 H3 局部计数器）---
    if (specialHeadings.h2) {
      // 情况1：已经是 special_h2 blok → 重置 h3Counter 并保留
      if (isSpecialH2Blok(node)) {
        h3Counter = 0;
        result.push(node);
        i++;
        continue;
      }
      // 情况2：anchor-only blok + 紧跟 heading level 2 → 合并为 special_h2 blok
      if (
        isAnchorOnlyBlok(node) &&
        i + 1 < nodes.length &&
        nodes[i + 1].type === "heading" &&
        (nodes[i + 1].attrs as Record<string, unknown>)?.level === 2
      ) {
        const headingNode = nodes[i + 1];
        const text = extractTextFromNode(headingNode);
        if (text.trim()) {
          h3Counter = 0;
          result.push(buildSpecialH2Blok(text));
          i += 2;
          continue;
        }
      }
      // 情况3：普通 heading level 2 → 转为 special_h2 blok
      if (
        node.type === "heading" &&
        (node.attrs as Record<string, unknown>)?.level === 2
      ) {
        const text = extractTextFromNode(node);
        if (text.trim()) {
          h3Counter = 0;
          result.push(buildSpecialH2Blok(text));
          i++;
          continue;
        }
      }
    } else {
      // H2 关闭：special_h2 blok → anchor-only blok + 普通 heading
      if (isSpecialH2Blok(node)) {
        h3Counter = 0;
        const attrs = node.attrs as Record<string, unknown>;
        const body = attrs.body as RichtextNode[];
        const anchorItem = body.find((b) => b.component === "anchor");
        const h2Item = body.find((b) => b.component === "special_h2");
        const text = (h2Item?.text as string) || (anchorItem?.description as string) || "";
        result.push({
          type: "blok",
          attrs: { body: [{ component: "anchor", description: text }] },
        });
        result.push({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text }],
        });
        i++;
        continue;
      }
      // H2 关闭：普通 heading level 2 → 重置 h3Counter
      if (
        node.type === "heading" &&
        (node.attrs as Record<string, unknown>)?.level === 2
      ) {
        h3Counter = 0;
      }
    }

    // --- H3 处理 ---
    if (specialHeadings.h3) {
      // 情况1：已经是 special_h3 blok → 更新 order 并保留
      if (isSpecialH3Blok(node)) {
        h3Counter++;
        const attrs = node.attrs as Record<string, unknown>;
        const body = attrs.body as RichtextNode[];
        const h3Item = body.find((b) => b.component === "special_h3");
        const text = (h3Item?.text as string) || "";
        result.push(buildSpecialH3Blok(text, h3Counter));
        i++;
        continue;
      }
      // 情况2：普通 heading level 3 → 转为 special_h3 blok
      if (
        node.type === "heading" &&
        (node.attrs as Record<string, unknown>)?.level === 3
      ) {
        const text = extractTextFromNode(node);
        if (text.trim()) {
          h3Counter++;
          result.push(buildSpecialH3Blok(text, h3Counter));
          i++;
          continue;
        }
      }
    } else {
      // H3 关闭：special_h3 blok → 普通 heading
      if (isSpecialH3Blok(node)) {
        const attrs = node.attrs as Record<string, unknown>;
        const body = attrs.body as RichtextNode[];
        const h3Item = body.find((b) => b.component === "special_h3");
        const text = (h3Item?.text as string) || "";
        result.push({
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text }],
        });
        i++;
        continue;
      }
    }

    // 其他节点直接保留
    result.push(node);
    i++;
  }

  return { ...richtext, content: result };
}
