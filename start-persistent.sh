#!/bin/bash

# 持久化服务启动脚本
# 使用PM2管理服务，确保Mac合盖后服务仍然运行

echo "🚀 启动持久化服务..."

# 检查PM2是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2未安装，正在安装..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "❌ PM2安装失败，请手动安装: npm install -g pm2"
        exit 1
    fi
fi

# 创建日志目录
mkdir -p logs

# 构建前端（如果需要）
echo "📦 检查前端构建..."
if [ ! -d "frontend/.next" ]; then
    echo "📦 构建前端应用..."
    cd frontend
    npm run build:network
    cd ..
fi

# 停止现有的PM2进程（如果有）
echo "🛑 停止现有服务..."
pm2 delete all 2>/dev/null || true

# 启动服务
echo "🚀 启动服务..."
pm2 start ecosystem.config.cjs

# 显示状态
echo "📊 服务状态:"
pm2 status

# 保存PM2配置
echo "💾 保存PM2配置..."
pm2 save

echo ""
echo "✅ 服务启动完成！"
echo "📱 本机访问: http://localhost:3001"
echo "🌐 局域网访问: http://192.168.101.79:3001"
echo ""
echo "📋 常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs"
echo "  重启服务: pm2 restart all"
echo "  停止服务: pm2 stop all"
echo ""
echo "⚠️  请确保Mac已配置为不休眠："
echo "  sudo pmset -a sleep 0"
echo "  sudo pmset -a displaysleep 10"
