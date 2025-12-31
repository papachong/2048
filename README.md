# 2048 Game - Vue + Pixi.js 版本

这是使用 Vue 3 和 Pixi.js 重构的2048游戏，包含完整的功能：

## ✨ 特性

- 🎮 **Vue 3 + Pixi.js** - 现代化的技术栈
- 🎨 **精美动画** - 流畅的方块移动和合并动画
- 💾 **保存/加载** - 随时保存和恢复游戏进度
- ↩️ **撤销功能** - 支持撤销最近10步操作
- 🏆 **排行榜系统** - 记录最佳成绩（前10名）
- 🔊 **音效系统** - 移动、合并等音效反馈
- 📱 **响应式设计** - 完美适配手机、平板和桌面
- ⌨️ **多种操作方式** - 支持键盘、触摸滑动

## 🚀 快速开始

### 方法 1: 使用原始Phaser版本（已有）
```bash
# 直接打开 index.html 或通过HTTP服务器
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 方法 2: 使用Vue + Pixi.js版本

#### 选项A - 使用npm（推荐）
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

#### 选项B - 直接运行（无需安装）
```bash
# 使用Python HTTP服务器
python3 -m http.server 8000

# 访问任意一个HTML文件
# http://localhost:8000/index.html (Phaser版本)
# http://localhost:8000/game-vue.html (Vue版本 - 开发中)
```

## 📁 项目结构

```
2048/
├── index.html              # 原始Phaser版本入口
├── game.js                 # Phaser游戏逻辑
├── index-vue.html          # Vue版本入口（需npm run dev）
├── game-vue.html           # Vue单文件版本（CDN）
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
└── src/                    # Vue源代码
    ├── main.js             # 应用入口
    ├── App.vue             # 主组件
    ├── style.css           # 全局样式
    ├── managers/           # 核心逻辑管理器
    │   ├── GameManager.js  # 游戏逻辑
    │   ├── PixiRenderer.js # Pixi.js渲染器
    │   └── SoundManager.js # 音效管理
    └── components/         # Vue组件
        └── Leaderboard.vue # 排行榜组件
```

## 🎮 游戏玩法

### 操作方式

**键盘控制:**
- 方向键 ↑ ↓ ← → 移动
- 或使用 W A S D 键

**触摸控制:**
- 在游戏板上滑动手指

### 游戏目标

合并相同数字的方块，达到 **2048** 即可获胜！

### 功能按钮

- **新游戏** - 开始新的游戏
- **撤销** - 撤销上一步操作（最多10步）
- **保存** - 保存当前游戏状态
- **加载** - 加载已保存的游戏
- **排行榜** - 查看历史最佳成绩
- **音效开关** - 🔊/🔇 切换音效

## 🔧 技术细节

### 核心技术

- **Vue 3** - 响应式UI框架
- **Pixi.js 7.3** - 高性能2D渲染引擎
- **Vite 5** - 快速的构建工具
- **Web Audio API** - 原生音效系统
- **LocalStorage** - 本地数据持久化

### 架构特点

1. **分离关注点** - 逻辑、渲染、音效各自独立
2. **响应式状态管理** - Vue响应式系统管理游戏状态
3. **高性能渲染** - Pixi.js Canvas渲染
4. **流畅动画** - 自定义缓动函数实现平滑动画
5. **移动优先** - 响应式设计，完美适配各种设备

## 📊 功能对比

| 功能 | Phaser版本 | Vue+Pixi版本 |
|------|-----------|-------------|
| 基础游戏 | ✅ | ✅ |
| 动画效果 | ⚡ 简单 | ⚡⚡⚡ 丰富流畅 |
| 撤销功能 | ❌ | ✅ (10步) |
| 保存/加载 | ⚠️ 占位 | ✅ 完整实现 |
| 排行榜 | ❌ | ✅ 前10名 |
| 音效 | ❌ | ✅ 完整 |
| 响应式 | ⚠️ 部分 | ✅ 完全响应式 |
| 代码架构 | 单文件 | 模块化 |

## 🐛 已知问题

1. Vue版本需要构建工具（Vite）才能运行
2. 音效使用Web Audio API生成，可替换为真实音频文件
3. 排行榜数据仅存储在本地浏览器

## 🔮 未来计划

- [ ] PWA支持（离线可玩）
- [ ] 在线排行榜（需后端）
- [ ] 多种皮肤主题
- [ ] 自定义难度（3x3, 5x5, 6x6）
- [ ] 游戏回放功能
- [ ] 社交分享功能

## 📝 开发说明

### 添加新功能

1. **新增管理器** - 在 `src/managers/` 创建
2. **新增组件** - 在 `src/components/` 创建
3. **修改游戏逻辑** - 编辑 `GameManager.js`
4. **修改渲染** - 编辑 `PixiRenderer.js`

### 调试技巧

```javascript
// 在浏览器控制台中
// 查看游戏板状态
console.log(gameManager.board)

// 查看分数
console.log(gameManager.score)

// 强制设置方块（测试用）
gameManager.board[0][0] = 2048
```

## 📄 许可证

LGPL License - 非商业用途自由使用

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**祝游戏愉快！🎮**
