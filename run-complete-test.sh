#!/bin/bash

cd "/Users/mac/Library/Mobile Documents/com~apple~CloudDocs/Development/AI/2048"

echo "═══════════════════════════════════════"
echo "运行2048游戏逻辑测试"
echo "═══════════════════════════════════════"
echo ""

# 运行完整测试
node complete-test.js

# 保存退出码
EXIT_CODE=$?

echo ""
echo "═══════════════════════════════════════"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ 测试全部通过！"
else
    echo "✗ 发现问题，请查看上述测试结果"
fi

echo "═══════════════════════════════════════"

exit $EXIT_CODE
