import AWS from "aws-sdk";
import mime from "mime";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { compressImageBuffer } from "./compressImageBuffer.js";
import { getProxyConfig } from "./proxyConfig.js";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
console.log("🚀 ~ bucketName:", bucketName);
const region = process.env.AWS_REGION_NOTTA;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID_NOTTA;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_NOTTA;
const s3FolderPath = "pictures/"; // 你的S3文件夹前缀
const assetsCDN = "https://www.notta.ai/"; // 你的CDN前缀

// 检查是否跳过图片上传
const skipImageUpload = process.env.SKIP_IMAGE_UPLOAD === 'true';
if (skipImageUpload) {
  console.log('🔄 图片上传已跳过，将直接返回原图片链接');
}

// 获取代理配置
const proxyConfig = getProxyConfig(process.env.HTTPS_PROXY || process.env.HTTP_PROXY);

// 配置 AWS SDK 的重试和超时
const awsConfig = {
  accessKeyId,
  secretAccessKey,
  region,
  httpOptions: {
    timeout: 60000, // 60秒超时
    connectTimeout: 30000, // 30秒连接超时
  },
  maxRetries: 3, // 最大重试次数
};

// 如果设置了代理，添加代理配置
if (proxyConfig.httpAgent || proxyConfig.httpsAgent) {
  console.log('🌐 为 AWS SDK 配置代理');
  awsConfig.httpOptions.agent = proxyConfig.httpAgent || proxyConfig.httpsAgent;
  awsConfig.httpsOptions = { agent: proxyConfig.httpsAgent || proxyConfig.httpAgent };
}

AWS.config.update(awsConfig);

const s3 = new AWS.S3();

/**
 * 上传远程图片到S3
 * @param {string} contentUri - 图片URL
 * @param {string} alt - 图片alt文本
 * @returns {Promise<string>} S3图片CDN URL 或原图片URL
 */
export async function imageUploader(contentUri, alt) {
  try {
    // 如果跳过图片上传，直接返回原图片链接
    if (skipImageUpload) {
      console.log(`🔄 跳过图片上传，直接返回原链接: ${contentUri}`);
      return contentUri;
    }

    // 1. 下载图片（使用代理）
    console.log(`📥 正在下载图片: ${contentUri}`);
    if (proxyConfig.httpAgent || proxyConfig.httpsAgent) {
      console.log('🌐 使用代理下载图片');
    }
    
    const response = await fetch(contentUri, {
      agent: proxyConfig.httpsAgent || proxyConfig.httpAgent,
      timeout: 30000 // 30秒下载超时
    });
    
    if (!response.ok) throw new Error(`图片下载失败: ${response.status} ${response.statusText}`);
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
    console.log(`📤 正在上传图片到S3: ${fileKey}`);
    const result = await s3.upload({
      Bucket: bucketName,
      Key: fileKey,
      Body: finalBuffer,
      ContentType:
        response.headers.get("content-type") || "application/octet-stream",
      StorageClass: "INTELLIGENT_TIERING",
      // 可选: Metadata: { alt }
    }).promise();

    // 5. 返回CDN URL
    const cdnUrl = `${assetsCDN}${fileKey}`;
    console.log(`✅ 图片上传成功: ${cdnUrl}`);
    return cdnUrl;
    
  } catch (error) {
    console.error(`❌ 图片上传失败: ${error.message}`);
    console.error(`🔍 错误详情:`, error);
    throw error;
  }
}
