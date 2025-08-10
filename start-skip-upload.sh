#!/bin/bash

# 跳过图片上传模式的启动脚本
# 这个脚本会设置环境变量 SKIP_IMAGE_UPLOAD=true，让图片上传器直接返回原图片链接

echo "🚀 启动跳过图片上传模式的服务器..."
echo "📸 图片将不会被上传到S3，直接使用原图片链接"
echo ""

# 设置环境变量
export SKIP_IMAGE_UPLOAD=true

# 显示当前配置
echo "当前配置:"
echo "  SKIP_IMAGE_UPLOAD: $SKIP_IMAGE_UPLOAD"
echo "  AWS_BUCKET_NAME: ${AWS_BUCKET_NAME:-'未设置'}"
echo "  AWS_REGION_NOTTA: ${AWS_REGION_NOTTA:-'未设置'}"
echo ""

# 启动服务器
echo "正在启动服务器..."
node api-server/server.js 