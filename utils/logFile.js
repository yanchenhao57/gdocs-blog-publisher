import fs from "fs";
import path from "path";

/**
 * 写日志文件
 * @param {string} name 文件名
 * @param {string} ext 扩展名
 * @param {string} dir 目录
 * @param {any} data 内容
 * @returns {string} - 写入后的文件完整路径
 */
export function logFile(name, ext, dir, data) {
  // 确保目录存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // 组装完整文件路径
  const filePath = path.join(dir, `${name}.${ext}`);
  let dataToWrite = data;
  // 如果是json类型，自动格式化
  if (ext.toLowerCase() === "json" && typeof data === "object") {
    dataToWrite = JSON.stringify(data, null, 2);
  }
  // 写入文件
  fs.writeFileSync(filePath, dataToWrite, "utf-8");
  // 返回完整路径
  return filePath;
}
