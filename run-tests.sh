#!/bin/bash

# 2048游戏测试脚本

echo "================================"
echo "2048游戏逻辑测试"
echo "================================"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 安装测试依赖
echo "正在安装测试依赖..."
npm install --save-dev vitest@^1.0.0 @vitest/ui@^1.0.0 jsdom@^23.0.0

echo ""
echo "开始运行测试..."
echo ""

# 运行测试
npm test

echo ""
echo "================================"
echo "测试完成"
echo "================================"
