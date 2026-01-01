# 渲染问题修复验证

## 问题描述
用户报告：`[2, 2, 4, 2]` 向左移动后，显示结果为 `[2, 4, 2, 0]`，但期望应该是 `[4, 4, 2, 0]`

## 根本原因
`findMerges()` 方法通过比较移动前后棋盘的值来判断合并位置，逻辑为：
```javascript
if (this.board[row][col] > oldBoard[row][col])
```

这导致当一个较大值移动到较小值的位置时，也会被错误地识别为"合并"。

例如在 `[2, 2, 4, 2]` 场景中：
- 位置(0,0): oldValue=2, newValue=4 → 被误认为合并
- **位置(0,1): oldValue=2, newValue=4 → 被误认为合并** ← 错误！
- 位置(0,2): oldValue=4, newValue=2 → 不认为合并

实际上只有位置(0,0)才是真正的合并（两个2合并成4）。

## 修复方案
添加新方法 `extractMergesFromAnimations()` 从动画数据中提取真正的合并位置：

```javascript
extractMergesFromAnimations(moveAnimations) {
  const mergePositions = new Map()
  
  moveAnimations.forEach(anim => {
    if (anim.merged) {  // 只有标记为merged的才是真正的合并
      const key = `${anim.to.row}-${anim.to.col}`
      mergePositions.set(key, {
        row: anim.to.row,
        col: anim.to.col,
        value: anim.resultValue
      })
    }
  })
  
  return Array.from(mergePositions.values())
}
```

在 `move()` 方法中替换：
```javascript
// 旧代码
return { moved, tiles, merges: this.findMerges(oldBoard), moveAnimations }

// 新代码
const merges = this.extractMergesFromAnimations(moveAnimations)
return { moved, tiles, merges, moveAnimations }
```

## 修复效果
### 修复前
```javascript
merges: [
  { row: 0, col: 0, value: 4 },  // 正确
  { row: 0, col: 1, value: 4 }   // 错误：这只是移动，不是合并
]
```

### 修复后
```javascript
merges: [
  { row: 0, col: 0, value: 4 }   // 正确：只有这个是合并
]
```

## 测试结果
- ✓ 144个测试全部通过
- ✓ 构建成功
- ✓ 合并位置识别准确

## 浏览器验证步骤
1. 打开 dist/index.html
2. 手动设置测试场景（或等待游戏自然出现该场景）：
   ```
   2 2 4 2
   0 0 0 0
   0 0 0 0
   0 0 0 0
   ```
3. 按左方向键
4. 预期结果：
   ```
   4 4 2 0
   0 0 0 0
   0 0 0 0
   0 0 0 0
   ```
5. 验证点：
   - ✓ 第一个位置显示4（两个2合并）
   - ✓ 第二个位置显示4（原来的4移动过来）
   - ✓ 第三个位置显示2（原来的2移动过来）
   - ✓ 第四个位置为空
   - ✓ 只有第一个位置有弹出动画（合并动画）

## 相关测试用例
测试组34中包含5个专门测试此类场景的用例：
- ✓ `2 2 4 2` 左移应合并
- ✓ `2 2 2 4` 左移应合并
- ✓ `4 2 2 8` 左移应合并
- ✓ 验证合并位置的动画数据
- ✓ `8 8 4 4` 左移双合并
