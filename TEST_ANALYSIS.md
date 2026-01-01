# 2048游戏逻辑测试分析

## 代码逻辑分析

### 问题1: slideAndMerge函数中的合并逻辑

在向左/向右移动时，`slideAndMerge`函数的合并逻辑存在问题。

#### 当前逻辑：
```javascript
// 步骤3：合并相邻相同值的方块
const merged = []
let i = 0
while (i < tiles.length) {
  const current = tiles[i]
  // 检查是否可以与下一个方块合并
  if (i + 1 < tiles.length && tiles[i + 1].value === current.value) {
    // 合并！
    const newValue = current.value * 2
    merged.push({
      value: newValue,
      sources: [current.originalPos, tiles[i + 1].originalPos],
      isMerged: true
    })
    this.score += newValue
    if (newValue === 2048 && !this.won) {
      this.won = true
    }
    i += 2 // 跳过两个方块
  } else {
    merged.push({
      value: current.value,
      sources: [current.originalPos],
      isMerged: false
    })
    i += 1
  }
}
```

#### 问题分析：

**测试用例1**: `[4, 4, 4, 4]` 向左移动
- 提取非零方块: `[{value:4, pos:0}, {value:4, pos:1}, {value:4, pos:2}, {value:4, pos:3}]`
- direction='left'，不反转
- 合并过程:
  - i=0: tiles[0]=4, tiles[1]=4 → 合并为8，i跳到2
  - i=2: tiles[2]=4, tiles[3]=4 → 合并为8，i跳到4
  - 结果: `merged = [{value:8}, {value:8}]`
  - 放置: `[8, 8, 0, 0]` ✓ **正确**

**测试用例2**: `[4, 4, 4, 4]` 向右移动
- 提取非零方块: `[{value:4, pos:0}, {value:4, pos:1}, {value:4, pos:2}, {value:4, pos:3}]`
- direction='right'，**反转**: `[{value:4, pos:3}, {value:4, pos:2}, {value:4, pos:1}, {value:4, pos:0}]`
- 合并过程:
  - i=0: tiles[0]=4(pos:3), tiles[1]=4(pos:2) → 合并为8，i跳到2
  - i=2: tiles[2]=4(pos:1), tiles[3]=4(pos:0) → 合并为8，i跳到4
  - 结果: `merged = [{value:8, sources:[3,2]}, {value:8, sources:[1,0]}]`
  - merged.reverse(): `[{value:8, sources:[1,0]}, {value:8, sources:[3,2]}]`
  - 放置到右边: size=4, merged.length=2
    - j=0: targetPos = 4-2+0 = 2, result[2] = 8
    - j=1: targetPos = 4-2+1 = 3, result[3] = 8
  - 最终: `[0, 0, 8, 8]` ✓ **正确**

通过仔细分析，这个逻辑看起来是正确的。

### 问题2: 检查move函数中的新方块生成

```javascript
if (moved) {
  this.moveCount++
  const newTile = this.spawnRandomTile()
  if (newTile) tiles.push(newTile)
  
  if (this.score > this.bestScore) {
    this.bestScore = this.score
    this.saveBestScore()
  }
  
  this.checkGameOver()
} else {
  this.history.pop() // 没有移动则撤销保存
}
```

这里在测试中可能会产生随机方块，影响测试结果。但这只影响返回值，不影响board本身的逻辑。

## 实际运行测试

让我创建一个简化版本来验证核心逻辑：
