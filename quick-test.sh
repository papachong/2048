#!/bin/bash

# 快速测试脚本 - 不安装依赖，直接运行

cd "/Users/mac/Library/Mobile Documents/com~apple~CloudDocs/Development/AI/2048"

echo "================================"
echo "安装测试依赖..."
echo "================================"
npm install --save-dev vitest@^1.0.0 @vitest/ui@^1.0.0 jsdom@^23.0.0

echo ""
echo "================================"
echo "运行2048游戏逻辑测试"
echo "================================"
npm test -- --run --reporter=verbose

echo ""
echo "测试完成！"
