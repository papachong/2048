// 手动模拟测试 - 验证核心算法
// 不依赖实际运行，手动模拟slideAndMerge的执行

console.log('===================================')
console.log('2048游戏核心算法手动验证')
console.log('===================================\n')

// 模拟slideAndMerge算法
function simulateSlideAndMerge(line, direction) {
  const size = 4
  
  // 步骤1：提取非零方块
  const tiles = []
  for (let i = 0; i < size; i++) {
    if (line[i] !== 0) {
      tiles.push({ value: line[i], originalPos: i })
    }
  }
  
  console.log(`  输入: [${line.join(', ')}], 方向: ${direction}`)
  console.log(`  提取的方块: ${JSON.stringify(tiles)}`)
  
  if (tiles.length === 0) {
    console.log(`  结果: 无方块，返回原数组\n`)
    return line
  }
  
  // 步骤2：根据方向反转
  if (direction === 'right') {
    tiles.reverse()
    console.log(`  反转后: ${JSON.stringify(tiles)}`)
  }
  
  // 步骤3：合并
  const merged = []
  let i = 0
  let totalScore = 0
  
  while (i < tiles.length) {
    const current = tiles[i]
    if (i + 1 < tiles.length && tiles[i + 1].value === current.value) {
      const newValue = current.value * 2
      merged.push({
        value: newValue,
        sources: [current.originalPos, tiles[i + 1].originalPos],
        isMerged: true
      })
      totalScore += newValue
      console.log(`  合并: ${current.value} + ${tiles[i + 1].value} = ${newValue} (分数+${newValue})`)
      i += 2
    } else {
      merged.push({
        value: current.value,
        sources: [current.originalPos],
        isMerged: false
      })
      i += 1
    }
  }
  
  console.log(`  合并后: ${JSON.stringify(merged.map(m => m.value))}`)
  console.log(`  总分数: ${totalScore}`)
  
  // 步骤4：放置到目标边缘
  const result = Array(size).fill(0)
  
  if (direction === 'left') {
    for (let j = 0; j < merged.length; j++) {
      result[j] = merged[j].value
      merged[j].targetPos = j
    }
  } else {
    merged.reverse()
    console.log(`  最终反转: ${JSON.stringify(merged.map(m => m.value))}`)
    for (let j = 0; j < merged.length; j++) {
      const targetPos = size - merged.length + j
      result[targetPos] = merged[j].value
      merged[j].targetPos = targetPos
    }
  }
  
  console.log(`  最终结果: [${result.join(', ')}]\n`)
  return result
}

// 测试用例
console.log('测试1: [4, 4, 4, 4] 向左')
console.log('预期: [8, 8, 0, 0]')
let result1 = simulateSlideAndMerge([4, 4, 4, 4], 'left')
console.log(`验证: ${JSON.stringify(result1) === JSON.stringify([8, 8, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试2: [4, 4, 4, 4] 向右')
console.log('预期: [0, 0, 8, 8]')
let result2 = simulateSlideAndMerge([4, 4, 4, 4], 'right')
console.log(`验证: ${JSON.stringify(result2) === JSON.stringify([0, 0, 8, 8]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试3: [2, 2, 4, 4] 向左')
console.log('预期: [4, 8, 0, 0]')
let result3 = simulateSlideAndMerge([2, 2, 4, 4], 'left')
console.log(`验证: ${JSON.stringify(result3) === JSON.stringify([4, 8, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试4: [2, 2, 4, 4] 向右')
console.log('预期: [0, 0, 4, 8]')
let result4 = simulateSlideAndMerge([2, 2, 4, 4], 'right')
console.log(`验证: ${JSON.stringify(result4) === JSON.stringify([0, 0, 4, 8]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试5: [2, 2, 2, 0] 向左 (三个相同)')
console.log('预期: [4, 2, 0, 0]')
let result5 = simulateSlideAndMerge([2, 2, 2, 0], 'left')
console.log(`验证: ${JSON.stringify(result5) === JSON.stringify([4, 2, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试6: [2, 0, 0, 2] 向左 (带间隔)')
console.log('预期: [4, 0, 0, 0]')
let result6 = simulateSlideAndMerge([2, 0, 0, 2], 'left')
console.log(`验证: ${JSON.stringify(result6) === JSON.stringify([4, 0, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试7: [2, 0, 2, 4] 向左')
console.log('预期: [4, 4, 0, 0]')
let result7 = simulateSlideAndMerge([2, 0, 2, 4], 'left')
console.log(`验证: ${JSON.stringify(result7) === JSON.stringify([4, 4, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试8: [0, 2, 0, 0] 向左')
console.log('预期: [2, 0, 0, 0]')
let result8 = simulateSlideAndMerge([0, 2, 0, 0], 'left')
console.log(`验证: ${JSON.stringify(result8) === JSON.stringify([2, 0, 0, 0]) ? '✓ 通过' : '✗ 失败'}\n`)

console.log('测试9: [2, 4, 8, 16] 向左 (无法移动)')
console.log('预期: [2, 4, 8, 16]')
let result9 = simulateSlideAndMerge([2, 4, 8, 16], 'left')
console.log(`验证: ${JSON.stringify(result9) === JSON.stringify([2, 4, 8, 16]) ? '✓ 通过' : '✗ 失败'}\n`)
