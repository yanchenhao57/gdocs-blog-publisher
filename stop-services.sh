#!/bin/bash

# 停止所有服务脚本

echo "🛑 停止所有服务..."

# 停止PM2管理的所有进程
pm2 stop all

# 删除PM2进程
pm2 delete all

echo "✅ 所有服务已停止"

# 显示状态确认
pm2 status
