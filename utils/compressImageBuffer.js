// utils/compressImageBuffer.js
import sharp from "sharp";

/**
 * 将图片 Buffer 进行压缩和格式转换
 * @param {Buffer} inputBuffer - 原始图片 Buffer
 * @param {Object} options
 * @param {'jpeg' | 'png' | 'webp'} [options.format='jpeg'] - 输出格式
 * @param {number} [options.width=1200] - 最大宽度
 * @param {number} [options.quality=80] - 压缩质量（0-100）
 * @returns {Promise<Buffer>} - 压缩后的图片 Buffer
 */
export async function compressImageBuffer(inputBuffer, options = {}) {
  const { format = "jpeg", width = 1200, quality = 80 } = options;

  try {
    const image = sharp(inputBuffer).resize({ width });

    switch (format) {
      case "png":
        return await image.png({ quality }).toBuffer();
      case "webp":
        return await image.webp({ quality }).toBuffer();
      case "jpeg":
      default:
        return await image.jpeg({ quality }).toBuffer();
    }
  } catch (err) {
    console.warn("⚠️ 图片压缩失败，使用原图:", err.message);
    return inputBuffer;
  }
}
