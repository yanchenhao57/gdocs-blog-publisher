import mermaid from "mermaid";

/**
 * 初始化 Mermaid 配置
 */
export const initMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose", // 允许点击交互
    flowchart: {
      useMaxWidth: false, // 不限制最大宽度，使用原始尺寸
      htmlLabels: true,
      curve: "basis",
      padding: 30, // 增加内边距
      nodeSpacing: 80, // 增加节点间距
      rankSpacing: 80, // 增加层级间距
    },
    themeVariables: {
      fontSize: "18px", // 进一步增大字体
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      primaryColor: "#fff",
      primaryTextColor: "#000",
      lineColor: "#333",
    },
    // 提高渲染质量
    deterministicIds: true,
    deterministicIDSeed: "mermaid",
  });
};

/**
 * 渲染 Mermaid 图表
 * @param code - Mermaid 源码
 * @param elementId - 容器元素 ID
 * @returns Promise<string> - 渲染后的 SVG 字符串
 */
export const renderMermaid = async (
  code: string,
  elementId: string
): Promise<string> => {
  try {
    // 生成唯一 ID
    const id = `mermaid-${elementId}-${Date.now()}`;

    // 渲染 Mermaid
    const { svg } = await mermaid.render(id, code);

    return svg;
  } catch (error) {
    console.error("Mermaid render error:", error);
    throw error;
  }
};

/**
 * 从 Mermaid SVG 中提取所有节点 ID
 * @param svgElement - SVG DOM 元素
 * @returns string[] - 节点 ID 数组
 */
export const extractNodeIds = (svgElement: SVGElement): string[] => {
  const nodeIds: string[] = [];

  // 查找所有带有 id 属性的 flowchart 节点
  // Mermaid 生成的节点通常有 class="node" 或类似的类名
  const nodes = svgElement.querySelectorAll(".node, [class*='flowchart-']");

  nodes.forEach((node) => {
    const id = node.id;
    if (id) {
      // Mermaid 生成的 ID 格式通常是 "flowchart-A-123"
      // 我们需要提取原始的节点 ID（如 "A"）
      const match = id.match(/flowchart-(.+?)-\d+/);
      if (match && match[1]) {
        nodeIds.push(match[1]);
      } else if (!id.startsWith("mermaid-")) {
        // 如果不是 mermaid- 开头的 ID，直接使用
        nodeIds.push(id);
      }
    }
  });

  return Array.from(new Set(nodeIds)); // 去重
};

/**
 * 为 SVG 节点绑定点击事件
 * @param svgElement - SVG DOM 元素
 * @param onNodeClick - 节点点击回调
 */
export const bindNodeClickEvents = (
  svgElement: SVGElement,
  onNodeClick: (nodeId: string) => void
) => {
  // 查找所有节点元素
  const nodes = svgElement.querySelectorAll(".node");

  nodes.forEach((node) => {
    const nodeElement = node as HTMLElement;

    // 添加点击事件
    nodeElement.style.cursor = "pointer";
    nodeElement.addEventListener("click", (e) => {
      e.stopPropagation();

      // 获取节点 ID
      const id = node.id;
      if (id) {
        // 提取原始节点 ID
        const match = id.match(/flowchart-(.+?)-\d+/);
        const originalId = match ? match[1] : id;

        console.log("Node clicked:", originalId);
        onNodeClick(originalId);
      }
    });

    // 添加 hover 效果
    nodeElement.addEventListener("mouseenter", () => {
      nodeElement.style.opacity = "0.8";
    });

    nodeElement.addEventListener("mouseleave", () => {
      nodeElement.style.opacity = "1";
    });
  });
};

/**
 * 高亮选中的节点
 * @param svgElement - SVG DOM 元素
 * @param selectedNodeId - 选中的节点 ID
 */
export const highlightSelectedNode = (
  svgElement: SVGElement,
  selectedNodeId: string | null
) => {
  // 移除所有高亮
  const allNodes = svgElement.querySelectorAll(".node");
  allNodes.forEach((node) => {
    const nodeElement = node as HTMLElement;
    nodeElement.classList.remove("mermaid-node-selected");

    const rect = node.querySelector("rect, circle, polygon");
    if (rect) {
      const rectElement = rect as HTMLElement;

      // 清除 attribute
      rect.removeAttribute("stroke");
      rect.removeAttribute("stroke-width");
      rect.removeAttribute("stroke-dasharray");
      rect.removeAttribute("stroke-linecap");
      rect.removeAttribute("stroke-linejoin");
      rect.removeAttribute("filter");

      // 清除 inline style
      rectElement.style.stroke = "";
      rectElement.style.strokeWidth = "";
      rectElement.style.strokeDasharray = "";
      rectElement.style.strokeLinecap = "";
      rectElement.style.strokeLinejoin = "";
    }
  });

  // 高亮选中的节点
  if (selectedNodeId) {
    const selectedNode = Array.from(allNodes).find((node) => {
      const id = node.id;
      const match = id.match(/flowchart-(.+?)-\d+/);
      const originalId = match ? match[1] : id;
      return originalId === selectedNodeId;
    });

    if (selectedNode) {
      const nodeElement = selectedNode as HTMLElement;
      nodeElement.classList.add("mermaid-node-selected");

      const rect = selectedNode.querySelector("rect, circle, polygon");
      if (rect) {
        // 添加黑色虚线边框（更粗）
        rect.setAttribute("stroke", "#000000");
        rect.setAttribute("stroke-width", "5");

        // 添加黑白相间的虚线样式（黑15 白15）
        rect.setAttribute("stroke-dasharray", "15 15");

        // 圆润的边角
        rect.setAttribute("stroke-linecap", "round");
        rect.setAttribute("stroke-linejoin", "round");

        // 确保样式优先级
        (rect as HTMLElement).style.stroke = "#000000";
        (rect as HTMLElement).style.strokeWidth = "5";
        (rect as HTMLElement).style.strokeDasharray = "15 15";
        (rect as HTMLElement).style.strokeLinecap = "round";
        (rect as HTMLElement).style.strokeLinejoin = "round";
      }
    }
  }
};

/**
 * 验证 Mermaid 代码是否有效
 * @param code - Mermaid 源码
 * @returns boolean - 是否有效
 */
export const validateMermaidCode = async (code: string): Promise<boolean> => {
  try {
    await mermaid.parse(code);
    return true;
  } catch (error) {
    return false;
  }
};
