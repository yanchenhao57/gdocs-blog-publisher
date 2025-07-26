import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { compressImageBuffer } from "../utils/compressImageBuffer.js";

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试目标图片 URL（可替换）
const imageUrl =
  "https://www.notta.ai/pictures/3673e129-4033-48b7-b99e-5dbeaa542c6b-jp-home-page-banner-cover.png";

// 输出路径
const outputDir = path.join(__dirname, "./output");
const originalPath = path.join(outputDir, "original.jpg");
const compressedPath = path.join(outputDir, "compressed.jpg");

// 确保输出目录存在
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function testCompress() {
  console.log("🔍 开始测试 compressImageBuffer");

  // 1. 下载图片
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  // 保存原图
  fs.writeFileSync(originalPath, buffer);
  console.log("📥 已保存原图:", originalPath);

  // 2. 执行压缩
  const compressed = await compressImageBuffer(buffer, {
    format: "jpeg",
    width: 800,
    quality: 70,
  });

  // 保存压缩图
  fs.writeFileSync(compressedPath, compressed);
  console.log("📦 已保存压缩图:", compressedPath);

  // 3. 输出体积对比
  const sizeOriginal = fs.statSync(originalPath).size;
  const sizeCompressed = fs.statSync(compressedPath).size;

  console.log("📊 大小对比:");
  console.log("   原图大小:", (sizeOriginal / 1024).toFixed(2), "KB");
  console.log("   压缩后:", (sizeCompressed / 1024).toFixed(2), "KB");
  console.log("✅ 测试完成");
}

testCompress().catch((err) => {
  console.error("❌ 测试出错:", err.message);
});
