import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * 导出/导入工具
 */

// 类型定义
export interface NodeDoc {
  id: string;
  content: string; // HTML string
}

export interface ExportData {
  version: string;
  exportedAt: string;
  mermaidCode: string;
  nodeDocs: Record<string, NodeDoc>;
  imageMap: Record<string, { originalSize: number; mimeType: string }>;
}

export interface ExportMetadata {
  toolVersion: string;
  projectName?: string;
  nodeCount: number;
  imageCount: number;
  totalSize: number;
}

// 从 base64 图片中提取 MIME 类型和扩展名
function getMimeTypeInfo(dataUrl: string): {
  mimeType: string;
  extension: string;
} {
  const match = dataUrl.match(/data:([^;]+);base64/);
  const mimeType = match ? match[1] : "image/png";

  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };

  const extension = extMap[mimeType] || "png";
  return { mimeType, extension };
}

// 从 HTML 中提取所有 base64 图片
function extractBase64Images(html: string, nodeId: string): {
  images: Array<{
    filename: string;
    base64: string;
    mimeType: string;
    dataUrl: string;
  }>;
  updatedHtml: string;
} {
  const images: Array<{
    filename: string;
    base64: string;
    mimeType: string;
    dataUrl: string;
  }> = [];

  let imageIndex = 0;
  const updatedHtml = html.replace(
    /<img([^>]*)src="(data:([^;]+);base64,([^"]+))"([^>]*)>/g,
    (match, prefix, dataUrl, mimeType, base64Data, suffix) => {
      const { extension } = getMimeTypeInfo(dataUrl);
      const filename = `images/node_${nodeId}_${imageIndex}.${extension}`;

      images.push({
        filename,
        base64: base64Data,
        mimeType,
        dataUrl,
      });

      imageIndex++;

      // 替换为相对路径
      return `<img${prefix}src="${filename}"${suffix}>`;
    }
  );

  return { images, updatedHtml };
}

// 将路径引用的图片转回 base64
function restoreBase64Images(
  html: string,
  imageFiles: Record<string, string>
): string {
  return html.replace(
    /<img([^>]*)src="(images\/[^"]+)"([^>]*)>/g,
    (match, prefix, imagePath, suffix) => {
      const base64Data = imageFiles[imagePath];
      if (base64Data) {
        return `<img${prefix}src="${base64Data}"${suffix}>`;
      }
      return match; // 保持原样
    }
  );
}

/**
 * 导出 Mermaid 文档为 ZIP 文件
 */
export async function exportMermaidDocs(
  mermaidCode: string,
  nodeDocs: Record<string, NodeDoc>,
  projectName?: string
): Promise<void> {
  try {
    const zip = new JSZip();
    const imageMap: Record<string, { originalSize: number; mimeType: string }> =
      {};
    const processedNodeDocs: Record<string, NodeDoc> = {};

    let totalImageCount = 0;
    let totalSize = 0;

    // 处理每个节点的文档，提取图片
    for (const [nodeId, doc] of Object.entries(nodeDocs)) {
      const { images, updatedHtml } = extractBase64Images(
        doc.content,
        nodeId
      );

      processedNodeDocs[nodeId] = {
        id: doc.id,
        content: updatedHtml,
      };

      // 将图片添加到 ZIP
      for (const img of images) {
        const imgData = atob(img.base64);
        const imgArray = new Uint8Array(imgData.length);
        for (let i = 0; i < imgData.length; i++) {
          imgArray[i] = imgData.charCodeAt(i);
        }

        zip.file(img.filename, imgArray);

        imageMap[img.filename] = {
          originalSize: imgArray.length,
          mimeType: img.mimeType,
        };

        totalSize += imgArray.length;
        totalImageCount++;
      }
    }

    // 创建主数据文件
    const exportData: ExportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      mermaidCode,
      nodeDocs: processedNodeDocs,
      imageMap,
    };

    zip.file("data.json", JSON.stringify(exportData, null, 2));

    // 创建元数据文件
    const metadata: ExportMetadata = {
      toolVersion: "1.5.1",
      projectName: projectName,
      nodeCount: Object.keys(nodeDocs).length,
      imageCount: totalImageCount,
      totalSize,
    };

    zip.file("metadata.json", JSON.stringify(metadata, null, 2));

    // 生成 ZIP 文件
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    // 下载文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = projectName
      ? `${projectName}-${timestamp}.mermaid-docs.zip`
      : `mermaid-docs-${timestamp}.zip`;

    saveAs(blob, filename);

    console.log(
      `✅ Export successful: ${metadata.nodeCount} nodes, ${metadata.imageCount} images`
    );
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Export failed, please try again");
  }
}

/**
 * 从 ZIP 文件导入 Mermaid 文档
 */
export async function importMermaidDocs(file: File): Promise<{
  mermaidCode: string;
  nodeDocs: Record<string, NodeDoc>;
  metadata: ExportMetadata;
}> {
  try {
    // Validate file type
    if (
      !file.name.endsWith(".zip") &&
      !file.name.endsWith(".mermaid-docs.zip")
    ) {
      throw new Error("Please select a valid .zip or .mermaid-docs.zip file");
    }

    // Unzip the file
    const zip = await JSZip.loadAsync(file);

    // Validate required files
    if (!zip.files["data.json"]) {
      throw new Error("Invalid import file: missing data.json");
    }

    // 读取主数据
    const dataJson = await zip.files["data.json"].async("string");
    const exportData: ExportData = JSON.parse(dataJson);

    // 读取元数据（可选）
    let metadata: ExportMetadata = {
      toolVersion: "1.0.0",
      nodeCount: 0,
      imageCount: 0,
      totalSize: 0,
    };

    if (zip.files["metadata.json"]) {
      const metadataJson = await zip.files["metadata.json"].async("string");
      metadata = JSON.parse(metadataJson);
    }

    // 读取所有图片文件
    const imageFiles: Record<string, string> = {};

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.startsWith("images/") && !file.dir) {
        const imgData = await file.async("uint8array");

        // 推断 MIME 类型
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          webp: "image/webp",
          svg: "image/svg+xml",
        };
        const mimeType = mimeMap[ext || "png"] || "image/png";

        // 转为 base64
        let binary = "";
        for (let i = 0; i < imgData.length; i++) {
          binary += String.fromCharCode(imgData[i]);
        }
        const base64 = btoa(binary);
        const dataUrl = `data:${mimeType};base64,${base64}`;

        imageFiles[filename] = dataUrl;
      }
    }

    // 恢复节点文档中的图片
    const restoredNodeDocs: Record<string, NodeDoc> = {};

    for (const [nodeId, doc] of Object.entries(exportData.nodeDocs)) {
      restoredNodeDocs[nodeId] = {
        id: doc.id,
        content: restoreBase64Images(doc.content, imageFiles),
      };
    }

    console.log(
      `✅ Import successful: ${metadata.nodeCount} nodes, ${metadata.imageCount} images`
    );

    return {
      mermaidCode: exportData.mermaidCode,
      nodeDocs: restoredNodeDocs,
      metadata,
    };
  } catch (error) {
    console.error("Import failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Import failed, please check the file format");
  }
}

/**
 * Backup current data to localStorage
 */
export function backupCurrentData(
  mermaidCode: string,
  nodeDocs: Record<string, NodeDoc>
): void {
  try {
    const backupKey = `mermaid-docs-backup-${Date.now()}`;
    const backupData = {
      mermaidCode,
      nodeDocs,
      backedUpAt: new Date().toISOString(),
    };

    localStorage.setItem(backupKey, JSON.stringify(backupData));

    // Keep only the last 3 backups
    const allKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("mermaid-docs-backup-")
    );

    if (allKeys.length > 3) {
      allKeys
        .sort()
        .slice(0, allKeys.length - 3)
        .forEach((key) => localStorage.removeItem(key));
    }

    console.log("✅ Current data backed up");
  } catch (error) {
    console.warn("Backup failed:", error);
  }
}

