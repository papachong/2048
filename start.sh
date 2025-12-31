#!/bin/bash

# 2048游戏快速启动脚本

echo "🎮 2048游戏 - 快速启动"
echo "========================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    echo "   访问: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo "✅ npm版本: $(npm -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

echo "🚀 启动开发服务器..."
echo ""
echo "📱 访问地址:"
echo "   - Vue版本: http://localhost:8000/index-vue.html"
echo "   - Phaser版本: http://localhost:8000/"
echo ""
echo "⌨️  操作方式:"
echo "   - 键盘: 方向键 或 WASD"
echo "   - 触摸: 滑动手势"
echo ""
echo "🎯 功能按钮:"
echo "   - 新游戏: 重新开始"
echo "   - 撤销: 回退一步（最多10步）"
echo "   - 保存: 保存当前进度"
echo "   - 加载: 恢复已保存的游戏"
echo "   - 排行榜: 查看历史最佳成绩"
echo "   - 🔊/🔇: 切换音效"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================"
echo ""

# 启动开发服务器
npm run dev
