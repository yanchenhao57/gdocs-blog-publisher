import AWS from "aws-sdk";
import mime from "mime";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { compressImageBuffer } from "./compressImageBuffer.js";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
console.log("🚀 ~ bucketName:", bucketName);
const region = process.env.AWS_REGION_NOTTA;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID_NOTTA;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_NOTTA;
const s3FolderPath = "pictures/"; // 你的S3文件夹前缀
const assetsCDN = "https://www.notta.ai/"; // 你的CDN前缀

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});
const s3 = new AWS.S3();

/**
 * 上传远程图片到S3
 * @param {string} contentUri - 图片URL
 * @param {string} alt - 图片alt文本
 * @returns {Promise<string>} S3图片CDN URL
 */
export async function imageUploader(contentUri, alt) {
  // 1. 下载图片
  const response = await fetch(contentUri);
  if (!response.ok) throw new Error("图片下载失败");
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // 2. 检查图片大小，小于200KB不压缩
  const imageSizeKB = buffer.length / 1024;
  const shouldCompress = imageSizeKB > 200;
  
  console.log(`📸 图片大小: ${imageSizeKB.toFixed(2)}KB, 是否需要压缩: ${shouldCompress ? '是' : '否'}`);
  
  let finalBuffer;
  if (shouldCompress) {
    // 压缩图片
    finalBuffer = await compressImageBuffer(buffer, {
      format: "jpeg",
      width: 1200,
      quality: 70,
    });
    console.log(`📸 压缩后大小: ${(finalBuffer.length / 1024).toFixed(2)}KB`);
  } else {
    // 不压缩，直接使用原图
    finalBuffer = buffer;
    console.log(`📸 图片较小，跳过压缩`);
  }

  // 3. 生成唯一文件名
  const ext =
    mime.getExtension(response.headers.get("content-type") || "") || "jpg";
  const fileName = `notta-blog-${uuidv4()}.${ext}`;
  const fileKey = `${s3FolderPath}${fileName}`;

  // 4. 上传到S3
  await s3
    .upload({
      Bucket: bucketName,
      Key: fileKey,
      Body: finalBuffer,
      ContentType:
        response.headers.get("content-type") || "application/octet-stream",
      StorageClass: "INTELLIGENT_TIERING",
      // 可选: Metadata: { alt }
    })
    .promise();

  // 5. 返回CDN URL
  return `${assetsCDN}${fileKey}`;
}
