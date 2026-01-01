// 完整的2048游戏逻辑测试
import { GameManager } from './src/managers/GameManager.js'

console.log('╔════════════════════════════════════════╗')
console.log('║     2048游戏逻辑完整测试套件          ║')
console.log('╚════════════════════════════════════════╝\n')

let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures = []

function test(category, name, fn) {
  totalTests++
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passedTests++
  } catch (error) {
    console.log(`  ✗ ${name}`)
    console.log(`    错误: ${error.message}`)
    failedTests++
    failures.push({ category, name, error: error.message })
  }
}

function assertEqual(actual, expected, message = '') {
  const actualStr = JSON.stringify(actual)
  const expectedStr = JSON.stringify(expected)
  if (actualStr !== expectedStr) {
    throw new Error(
      `${message}\n    期望: ${expectedStr}\n    实际: ${actualStr}`
    )
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(message || '期望值为true，实际为false')
  }
}

function assertFalse(value, message = '') {
  if (value) {
    throw new Error(message || '期望值为false，实际为true')
  }
}

// ═══════════════════════════════════════════════════════════
// 测试套件
// ═══════════════════════════════════════════════════════════

console.log('【测试组1】初始化测试')
console.log('─────────────────────────────────')

test('初始化', '应该创建4x4的空棋盘', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  
  assertEqual(game.board.length, 4)
  assertEqual(game.board[0].length, 4)
  assertTrue(game.board.every(row => row.every(cell => cell === 0)))
})

test('初始化', '应该初始化分数和状态', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  
  assertEqual(game.score, 0)
  assertEqual(game.moveCount, 0)
  assertFalse(game.gameOver)
  assertFalse(game.won)
})

console.log('\n【测试组2】向左移动')
console.log('─────────────────────────────────')

test('向左移动', '应该将单个方块移到最左边', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 2]
  
  game.move('left')
  
  assertEqual(game.board[0], [2, 0, 0, 0])
})

test('向左移动', '应该合并相邻相同方块', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.score, 4)
})

test('向左移动', '四个相同方块应该合并为两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 4, 4, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 8, 0, 0])
  assertEqual(game.score, 16)
})

test('向左移动', '三个相同方块应该只合并前两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 2, 0, 0])
})

test('向左移动', '带间隔的相同方块应该合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 2]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
})

test('向左移动', '混合移动和合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 2, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 4, 0, 0])
})

test('向左移动', '已在最左侧且不可合并时不应移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [2, 4, 8, 16])
})

console.log('\n【测试组3】向右移动')
console.log('─────────────────────────────────')

test('向右移动', '应该将单个方块移到最右边', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 0]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 2])
})

test('向右移动', '应该合并相邻相同方块', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 2, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 4])
  assertEqual(game.score, 4)
})

test('向右移动', '四个相同方块应该合并为两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 4, 4, 4]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 8, 8])
  assertEqual(game.score, 16)
})

test('向右移动', '三个相同方块应该只合并后两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 2, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 2, 4])
})

test('向右移动', '带间隔的相同方块应该合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 4])
})

test('向右移动', '混合移动和合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 4]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 4, 4])
})

console.log('\n【测试组4】向上移动')
console.log('─────────────────────────────────')

test('向上移动', '应该将方块移到顶部', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 2)
  assertEqual(game.board[3][0], 0)
})

test('向上移动', '应该合并相同方块', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 4)
  assertEqual(game.board[1][0], 0)
  assertEqual(game.score, 4)
})

test('向上移动', '四个相同方块应该合并为两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 8)
  assertEqual(game.board[1][0], 8)
  assertEqual(game.board[2][0], 0)
  assertEqual(game.board[3][0], 0)
})

console.log('\n【测试组5】向下移动')
console.log('─────────────────────────────────')

test('向下移动', '应该将方块移到底部', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 2)
  assertEqual(game.board[0][0], 0)
})

test('向下移动', '应该合并相同方块', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [2, 0, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 4)
  assertEqual(game.board[2][0], 0)
  assertEqual(game.score, 4)
})

test('向下移动', '四个相同方块应该合并为两个', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 8)
  assertEqual(game.board[2][0], 8)
  assertEqual(game.board[1][0], 0)
  assertEqual(game.board[0][0], 0)
})

console.log('\n【测试组6】分数计算')
console.log('─────────────────────────────────')

test('分数', '合并应该增加分数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 4, 4]
  
  game.move('left')
  
  // 2+2=4(+4), 4+4=8(+8) = +12
  assertEqual(game.score, 12)
})

test('分数', '移动但不合并不应增加分数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 0, 4]
  
  const initialScore = game.score
  game.move('left')
  
  assertEqual(game.score, initialScore)
})

test('分数', '多次操作应该累计分数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')  // +4 +8 = 12
  
  game.board = [
    [4, 0, 0, 0],
    [8, 0, 0, 0],
    [8, 8, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('down')  // +16 = 28 total
  
  assertTrue(game.score >= 12)
})

console.log('\n【测试组7】游戏结束判断')
console.log('─────────────────────────────────')

test('游戏结束', '有空格时不应结束', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 4, 8, 0],
    [8, 2, 4, 8]
  ]
  
  assertFalse(game.checkGameOver())
  assertFalse(game.gameOver)
})

test('游戏结束', '有可合并方块时不应结束', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 4, 8, 16],
    [8, 2, 2, 8]
  ]
  
  assertFalse(game.checkGameOver())
})

test('游戏结束', '无空格且无可合并方块时应该结束', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 16, 8, 4],
    [8, 2, 4, 8]
  ]
  
  assertTrue(game.checkGameOver())
  assertTrue(game.gameOver)
})

console.log('\n【测试组8】撤销功能')
console.log('─────────────────────────────────')

test('撤销', '应该能撤销上一步操作', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const boardBefore = JSON.parse(JSON.stringify(game.board))
  const scoreBefore = game.score
  
  game.move('left')
  
  const undoResult = game.undo()
  
  assertTrue(undoResult)
  assertEqual(game.board, boardBefore)
  assertEqual(game.score, scoreBefore)
})

test('撤销', '无历史记录时不应能撤销', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  
  const undoResult = game.undo()
  
  assertFalse(undoResult)
})

test('撤销', '无效移动不应保存历史', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  game.move('left')  // 无法移动
  
  const undoResult = game.undo()
  assertFalse(undoResult)
})

console.log('\n【测试组9】获胜条件')
console.log('─────────────────────────────────')

test('获胜', '合并出2048应该获胜', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [1024, 1024, 0, 0]
  
  game.move('left')
  
  assertTrue(game.won)
  assertEqual(game.board[0][0], 2048)
})

test('获胜', '未达到2048不应获胜', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [512, 512, 0, 0]
  
  game.move('left')
  
  assertFalse(game.won)
  assertEqual(game.board[0][0], 1024)
})

console.log('\n【测试组10】复杂场景')
console.log('─────────────────────────────────')

test('复杂场景', '多行同时移动和合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 2, 0, 2],
    [4, 0, 4, 0],
    [0, 8, 0, 8],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.board[1], [8, 0, 0, 0])
  assertEqual(game.board[2], [16, 0, 0, 0])
})

test('复杂场景', '游戏结束后不应允许移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.gameOver = true
  game.board[0] = [2, 0, 0, 0]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
})

console.log('\n【测试组11】边界情况')
console.log('─────────────────────────────────')

test('边界情况', '全空棋盘移动应该不改变', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  
  const result = game.move('left')
  
  assertFalse(result.moved)
  assertTrue(game.board.every(row => row.every(cell => cell === 0)))
})

test('边界情况', '只有一个方块在角落', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[3][3] = 2
  
  game.move('left')
  
  assertEqual(game.board[3][0], 2)
  assertEqual(game.board[3][3], 0)
})

test('边界情况', '棋盘满但可合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 4, 4],
    [4, 4, 2, 2],
    [2, 2, 4, 4],
    [4, 4, 2, 2]
  ]
  
  assertFalse(game.checkGameOver())
  game.move('left')
  assertTrue(game.score > 0)
})

test('边界情况', '单行所有方块相同', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 2]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 4, 0, 0])
  assertEqual(game.score, 8)
})

test('边界情况', '大数值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [512, 512, 256, 256]
  
  game.move('left')
  
  assertEqual(game.board[0], [1024, 512, 0, 0])
  assertEqual(game.score, 1536)
})

console.log('\n【测试组12】连续操作')
console.log('─────────────────────────────────')

test('连续操作', '连续向同一方向移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  const score1 = game.score
  game.move('left')
  const score2 = game.score
  
  assertEqual(score1, score2) // 第二次移动无效
})

test('连续操作', '四个方向循环移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[1][1] = 2
  
  game.move('left')
  assertEqual(game.board[1][0], 2)
  
  game.move('up')
  assertEqual(game.board[0][0], 2)
  
  game.move('right')
  assertEqual(game.board[0][3], 2)
  
  game.move('down')
  assertEqual(game.board[3][3], 2)
})

test('连续操作', '复杂连续合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')   // [4,0,0,0], [8,0,0,0]
  assertEqual(game.score, 12)
  
  // 继续在同一个游戏中操作
  game.board[0][1] = 4
  game.board[1][1] = 8
  
  game.move('left')   // [4,4,0,0], [8,8,0,0]
  game.move('left')   // [8,0,0,0], [16,0,0,0]
  
  // 总分：12 + 8 + 16 = 36
  assertEqual(game.score, 36)
})

console.log('\n【测试组13】特殊排列')
console.log('─────────────────────────────────')

test('特殊排列', '交替排列向左', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 2, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [2, 4, 2, 4])
  assertEqual(game.score, 0)
})

test('特殊排列', '间隔两个空格', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 0, 0, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 0, 0, 0])
  assertEqual(game.score, 8)
})

test('特殊排列', '三段式排列', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 4, 8]
  
  game.move('left')
  
  assertEqual(game.board[0], [2, 4, 8, 0])
  assertEqual(game.score, 0)
})

test('特殊排列', '对称排列向中间', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 2],
    [0, 4, 4, 0],
    [8, 0, 0, 8],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.board[1], [8, 0, 0, 0])
  assertEqual(game.board[2], [16, 0, 0, 0])
})

console.log('\n【测试组14】向上向下特殊测试')
console.log('─────────────────────────────────')

test('向上向下', '多列同时合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [2, 4, 8, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0], [4, 8, 16, 32])
  assertEqual(game.score, 60) // 4+8+16+32
})

test('向上向下', '间隔合并向上', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 4)
  assertEqual(game.board[1][0], 0)
  assertEqual(game.board[2][0], 0)
})

test('向上向下', '间隔合并向下', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [4, 0, 0, 0],
    [0, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 8)
  assertEqual(game.board[2][0], 0)
  assertEqual(game.board[1][0], 0)
})

test('向上向下', '三个方块向上', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 4)
  assertEqual(game.board[1][0], 4)
  assertEqual(game.board[2][0], 0)
})

console.log('\n【测试组15】撤销进阶测试')
console.log('─────────────────────────────────')

test('撤销进阶', '连续操作后撤销', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const boardStart = JSON.parse(JSON.stringify(game.board))
  
  game.move('left')
  game.move('down')
  
  game.undo()
  game.undo()
  
  assertEqual(game.board, boardStart)
  assertEqual(game.score, 0)
})

test('撤销进阶', '撤销次数限制', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  
  // 进行12次有效移动（超过maxHistory=10）
  for (let i = 0; i < 12; i++) {
    game.board[0][0] = 2
    game.board[0][1] = 2
    game.move('left')
    game.board[0][0] = 0
    game.board[0][1] = 0
  }
  
  // 只能撤销10次
  let undoCount = 0
  while (game.undo()) {
    undoCount++
  }
  
  assertTrue(undoCount <= 10)
})

console.log('\n【测试组16】分数进阶测试')
console.log('─────────────────────────────────')

test('分数进阶', '多次大数值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [256, 256, 512, 512]
  
  game.move('left')
  
  assertEqual(game.board[0], [512, 1024, 0, 0])
  assertEqual(game.score, 1536) // 512 + 1024
})

test('分数进阶', '整个棋盘同时合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 4, 4],
    [8, 8, 16, 16],
    [32, 32, 64, 64],
    [128, 128, 256, 256]
  ]
  
  game.move('left')
  
  // 4+8+16+32+64+128+256+512 = 1020
  assertEqual(game.score, 1020)
})

test('分数进阶', '无效移动不影响moveCount', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const moveCountBefore = game.moveCount
  game.move('left')
  
  assertEqual(game.moveCount, moveCountBefore)
})

console.log('\n【测试组17】动画数据生成测试')
console.log('─────────────────────────────────')

test('动画数据', '向左移动应生成正确动画数据', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 2]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 1)
  assertEqual(result.moveAnimations[0].from, { row: 0, col: 3 })
  assertEqual(result.moveAnimations[0].to, { row: 0, col: 0 })
  assertEqual(result.moveAnimations[0].value, 2)
  assertFalse(result.moveAnimations[0].merged)
})

test('动画数据', '向右移动应生成正确动画数据', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 0]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 1)
  assertEqual(result.moveAnimations[0].from, { row: 0, col: 0 })
  assertEqual(result.moveAnimations[0].to, { row: 0, col: 3 })
  assertEqual(result.moveAnimations[0].value, 2)
})

test('动画数据', '合并时应生成两个动画', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 2)
  // 两个方块都应该有动画
  assertTrue(result.moveAnimations.some(a => a.from.col === 0 && a.to.col === 0))
  assertTrue(result.moveAnimations.some(a => a.from.col === 1 && a.to.col === 0))
  // 至少一个标记为merged
  assertTrue(result.moveAnimations.some(a => a.merged === true))
})

test('动画数据', '多个方块移动应生成对应数量动画', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 0, 4]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 2)
})

test('动画数据', '向上移动列数据正确', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 0, 0]
  ]
  
  const result = game.move('up')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 1)
  assertEqual(result.moveAnimations[0].from, { row: 3, col: 0 })
  assertEqual(result.moveAnimations[0].to, { row: 0, col: 0 })
})

test('动画数据', '向下移动列数据正确', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const result = game.move('down')
  
  assertTrue(result.moved)
  assertEqual(result.moveAnimations.length, 1)
  assertEqual(result.moveAnimations[0].from, { row: 0, col: 0 })
  assertEqual(result.moveAnimations[0].to, { row: 3, col: 0 })
})

console.log('\n【测试组18】方块图层显示测试')
console.log('─────────────────────────────────')

test('方块图层', '左右移动后方块位置正确', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  assertEqual(game.board[0], [2, 4, 0, 0])
  
  game.move('right')
  assertEqual(game.board[0], [0, 0, 2, 4])
})

test('方块图层', '复杂左右移动后状态正确', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  assertEqual(game.board[0], [4, 8, 0, 0])
  
  // 重置
  game.board[0] = [2, 2, 4, 4]
  game.move('right')
  assertEqual(game.board[0], [0, 0, 4, 8])
})

test('方块图层', '间隔方块左右移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 2, 0]
  
  game.move('left')
  assertEqual(game.board[0], [4, 0, 0, 0])
  
  // 重置
  game.board[0] = [2, 0, 2, 0]
  game.move('right')
  assertEqual(game.board[0], [0, 0, 0, 4])
})

test('方块图层', '多行同时左右移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [0, 2, 0, 2],
    [4, 0, 4, 0],
    [0, 8, 0, 8],
    [16, 0, 16, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.board[1], [8, 0, 0, 0])
  assertEqual(game.board[2], [16, 0, 0, 0])
  assertEqual(game.board[3], [32, 0, 0, 0])
})

test('方块图层', '向右移动不同行独立处理', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 8, 0],
    [0, 0, 0, 16]
  ]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 2])
  assertEqual(game.board[1], [0, 0, 0, 4])
  assertEqual(game.board[2], [0, 0, 0, 8])
  assertEqual(game.board[3], [0, 0, 0, 16])
})

console.log('\n【测试组19】左右移动边界测试')
console.log('─────────────────────────────────')

test('左右边界', '最左边方块向左不移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 0]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [2, 0, 0, 0])
})

test('左右边界', '最右边方块向右不移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 2]
  
  const result = game.move('right')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [0, 0, 0, 2])
})

test('左右边界', '满行不同值左右不移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const leftResult = game.move('left')
  assertFalse(leftResult.moved)
  
  const rightResult = game.move('right')
  assertFalse(rightResult.moved)
  
  assertEqual(game.board[0], [2, 4, 8, 16])
})

test('左右边界', '全零行移动无效', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 0]
  
  const leftResult = game.move('left')
  assertFalse(leftResult.moved)
  
  const rightResult = game.move('right')
  assertFalse(rightResult.moved)
})

console.log('\n【测试组20】合并动画标记测试')
console.log('─────────────────────────────────')

test('合并标记', '简单合并标记正确', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  const result = game.move('left')
  
  // 两个方块移动，其中至少一个标记为merged
  const mergedAnimations = result.moveAnimations.filter(a => a.merged)
  assertTrue(mergedAnimations.length > 0)
})

test('合并标记', '无合并时没有merged标记', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 0, 4]
  
  const result = game.move('left')
  
  const mergedAnimations = result.moveAnimations.filter(a => a.merged)
  assertEqual(mergedAnimations.length, 0)
})

test('合并标记', '多次合并都有标记', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const result = game.move('left')
  
  const mergedAnimations = result.moveAnimations.filter(a => a.merged)
  assertTrue(mergedAnimations.length >= 2) // 至少两个合并
})

console.log('\n【测试组21】极端场景测试')
console.log('─────────────────────────────────')

test('极端场景', '全满棋盘可合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2]
  ]
  
  assertFalse(game.checkGameOver())
  const result = game.move('left')
  assertTrue(result.moved)
})

test('极端场景', '单列全相同向上', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 8)
  assertEqual(game.board[1][0], 8)
  assertEqual(game.board[2][0], 0)
  assertEqual(game.board[3][0], 0)
  assertEqual(game.score, 16)
})

test('极端场景', '最大方块不能合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4096, 2048, 1024, 512]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
})

test('极端场景', '对角线排列', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 8, 0],
    [0, 0, 0, 16]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0][0], 2)
  assertEqual(game.board[1][0], 4)
  assertEqual(game.board[2][0], 8)
  assertEqual(game.board[3][0], 16)
})

test('极端场景', '交替高低值', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [1024, 0, 1024, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [2048, 0, 0, 0])
  assertEqual(game.score, 2048)
})

console.log('\n【测试组22】混合方向连续操作')
console.log('─────────────────────────────────')

test('混合方向', '上下左右循环测试', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('right')
  assertEqual(game.board[0][3], 2)
  
  game.move('down')
  assertEqual(game.board[3][3], 2)
  
  game.move('left')
  assertEqual(game.board[3][0], 2)
  
  game.move('up')
  assertEqual(game.board[0][0], 2)
})

test('混合方向', '来回移动合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  assertEqual(game.board[0], [4, 0, 0, 0])
  
  game.board[0][3] = 4
  game.move('right')
  assertEqual(game.board[0], [0, 0, 0, 8])
})

test('混合方向', '垂直水平交替', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')  // [4, 0, 0, 0], [8, 0, 0, 0]
  game.move('up')    // [4, 0, 0, 0], [8, 0, 0, 0] -> [12, 0, 0, 0]? 不，应该保持
  
  assertTrue(game.board[0][0] > 0)
})

console.log('\n【测试组23】大数值组合测试')
console.log('─────────────────────────────────')

test('大数值', '1024合并测试', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [512, 512, 256, 256]
  
  game.move('left')
  
  assertEqual(game.board[0], [1024, 512, 0, 0])
  assertTrue(game.score >= 1536)
})

test('大数值', '接近2048的合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [1024, 1024, 512, 256]
  
  game.move('left')
  
  assertEqual(game.board[0][0], 2048)
  assertTrue(game.won)
})

test('大数值', '超过2048继续游戏', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2048, 2048, 0, 0]
  game.won = true
  
  game.move('left')
  
  assertEqual(game.board[0][0], 4096)
  assertTrue(game.won) // 保持获胜状态
})

test('大数值', '多个大数值不合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2048, 1024, 512, 256]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
})

console.log('\n【测试组24】复杂合并模式')
console.log('─────────────────────────────────')

test('复杂合并', '三对相同值', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 4, 4],
    [8, 8, 16, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 8, 0, 0])
  assertEqual(game.board[1], [16, 32, 0, 0])
})

test('复杂合并', '间隔合并模式', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 2, 0]
  
  game.move('left')
  assertEqual(game.board[0], [4, 0, 0, 0])
  
  game.board[0] = [0, 2, 0, 2]
  game.move('right')
  assertEqual(game.board[0], [0, 0, 0, 4])
})

test('复杂合并', '全行不同模式', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 2, 4]
  
  game.move('left')
  
  // 不应该有任何合并
  assertEqual(game.board[0], [2, 4, 2, 4])
})

test('复杂合并', '五个相同值排列', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 2, 2],
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 4, 0, 0])
  assertEqual(game.board[1], [2, 0, 0, 0])
})

console.log('\n【测试组25】游戏状态转换')
console.log('─────────────────────────────────')

test('游戏状态', '从未获胜到获胜', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  assertFalse(game.won)
  
  game.board[0] = [1024, 1024, 0, 0]
  game.move('left')
  
  assertTrue(game.won)
  assertEqual(game.board[0][0], 2048)
})

test('游戏状态', '获胜后继续合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.won = true
  game.board[0] = [4, 4, 0, 0]
  
  game.move('left')
  
  assertEqual(game.board[0][0], 8)
  assertTrue(game.won)
})

test('游戏状态', 'moveCount正确递增', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  assertEqual(game.moveCount, 0)
  
  game.board[0] = [2, 0, 0, 0]
  game.move('right')
  assertEqual(game.moveCount, 1)
  
  game.move('left')
  assertEqual(game.moveCount, 2)
})

test('游戏状态', '无效移动不增加计数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const beforeCount = game.moveCount
  game.move('left')
  
  assertEqual(game.moveCount, beforeCount)
})

console.log('\n【测试组26】分数边界测试')
console.log('─────────────────────────────────')

test('分数边界', '分数不会减少', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  game.move('left')
  const score1 = game.score
  assertTrue(score1 > 0)
  
  game.board[0] = [4, 0, 0, 0]
  game.move('right')
  const score2 = game.score
  
  assertTrue(score2 >= score1)
})

test('分数边界', '超大合并分数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2048, 2048, 0, 0],
    [1024, 1024, 0, 0],
    [512, 512, 0, 0],
    [256, 256, 0, 0]
  ]
  
  game.move('left')
  
  // 4096 + 2048 + 1024 + 512 = 7680
  assertEqual(game.score, 7680)
})

test('分数边界', '只移动不合并分数为0', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 2]
  
  game.move('left')
  
  assertEqual(game.score, 0)
})

console.log('\n【测试组27】撤销复杂场景')
console.log('─────────────────────────────────')

test('撤销复杂', '撤销后再操作', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const initialBoard = JSON.parse(JSON.stringify(game.board))
  game.move('left')
  game.undo()
  
  assertEqual(game.board, initialBoard)
  
  // 撤销后可以继续操作
  game.move('right')
  assertTrue(game.board[0][3] > 0)
})

test('撤销复杂', '多次移动后撤销到初始', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 0]
  const initialBoard = JSON.parse(JSON.stringify(game.board))
  
  game.move('right')
  game.move('down')
  game.move('left')
  
  game.undo()
  game.undo()
  game.undo()
  
  assertEqual(game.board, initialBoard)
})

test('撤销复杂', '撤销恢复分数', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  const initialScore = game.score
  game.move('left')
  const afterScore = game.score
  assertTrue(afterScore > initialScore)
  
  game.undo()
  assertEqual(game.score, initialScore)
})

console.log('\n【测试组28】边界值压力测试')
console.log('─────────────────────────────────')

test('压力测试', '连续100次无效操作', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  for (let i = 0; i < 100; i++) {
    game.move('left')
  }
  
  assertEqual(game.board[0], [2, 4, 8, 16])
  assertEqual(game.moveCount, 0)
})

test('压力测试', '快速来回移动', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0][0] = 2
  
  for (let i = 0; i < 50; i++) {
    game.move(i % 2 === 0 ? 'right' : 'left')
  }
  
  // 方块应该在某个位置
  const hasValue = game.board[0].some(v => v === 2)
  assertTrue(hasValue)
})

test('压力测试', '满棋盘状态检查', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  ]
  
  assertTrue(game.checkGameOver())
})

console.log('\n【测试组29】左移动合并专项测试')
console.log('─────────────────────────────────')

test('左移合并', '两个2合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 0, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.score, 4)
})

test('左移合并', '三个2从左开始', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 2, 0, 0])
  assertEqual(game.score, 4)
})

test('左移合并', '三个2从右开始', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 2, 2]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 2, 0, 0])
  assertEqual(game.score, 4)
})

test('左移合并', '四个2全部合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 2]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 4, 0, 0])
  assertEqual(game.score, 8)
})

test('左移合并', '两对不同值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 4, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 8, 0, 0])
  assertEqual(game.score, 12)
})

test('左移合并', '间隔相同值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 0, 4, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 0, 0, 0])
  assertEqual(game.score, 8)
})

test('左移合并', '多个间隔相同值', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [8, 0, 8, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [16, 0, 0, 0])
  assertEqual(game.score, 16)
})

test('左移合并', '前后有空格中间合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 16, 16, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [32, 0, 0, 0])
  assertEqual(game.score, 32)
})

test('左移合并', '交替值不合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 2, 4]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [2, 4, 2, 4])
})

test('左移合并', '大数值合并512', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [256, 256, 0, 0]
  
  game.move('left')
  
  assertEqual(game.board[0], [512, 0, 0, 0])
  assertEqual(game.score, 512)
})

console.log('\n【测试组30】右移动合并专项测试')
console.log('─────────────────────────────────')

test('右移合并', '两个2合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 2, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 4])
  assertEqual(game.score, 4)
})

test('右移合并', '三个2从右开始', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 2, 2, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 2, 4])
  assertEqual(game.score, 4)
})

test('右移合并', '三个2从左开始', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 0]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 2, 4])
  assertEqual(game.score, 4)
})

test('右移合并', '四个2全部合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 2]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 4, 4])
  assertEqual(game.score, 8)
})

test('右移合并', '两对不同值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 4, 4]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 4, 8])
  assertEqual(game.score, 12)
})

test('右移合并', '间隔相同值合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 4, 0, 4]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 8])
  assertEqual(game.score, 8)
})

test('右移合并', '多个间隔相同值', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 8, 0, 8]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 16])
  assertEqual(game.score, 16)
})

test('右移合并', '前后有空格中间合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 16, 16, 0]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 32])
  assertEqual(game.score, 32)
})

test('右移合并', '交替值不合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 2, 4]
  
  const result = game.move('right')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [2, 4, 2, 4])
})

test('右移合并', '大数值合并512', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 256, 256]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 512])
  assertEqual(game.score, 512)
})

console.log('\n【测试组31】左右对比测试')
console.log('─────────────────────────────────')

test('左右对比', '同样布局左右移动结果对称', () => {
  const game1 = new GameManager({ testMode: true })
  game1.initBoard()
  game1.board[0] = [2, 0, 0, 2]
  
  const game2 = new GameManager({ testMode: true })
  game2.initBoard()
  game2.board[0] = [2, 0, 0, 2]
  
  game1.move('left')
  game2.move('right')
  
  assertEqual(game1.board[0], [4, 0, 0, 0])
  assertEqual(game2.board[0], [0, 0, 0, 4])
  assertEqual(game1.score, game2.score)
})

test('左右对比', '复杂布局对称性', () => {
  const game1 = new GameManager({ testMode: true })
  game1.initBoard()
  game1.board[0] = [2, 2, 4, 4]
  
  const game2 = new GameManager({ testMode: true })
  game2.initBoard()
  game2.board[0] = [2, 2, 4, 4]
  
  game1.move('left')
  game2.move('right')
  
  assertEqual(game1.score, game2.score)
  assertEqual(game1.score, 12)
})

test('左右对比', '左右连续移动回到原位', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 2]
  
  game.move('left')
  assertEqual(game.board[0], [2, 0, 0, 0])
  
  game.move('right')
  assertEqual(game.board[0], [0, 0, 0, 2])
})

test('左右对比', '多次左右往返', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  for (let i = 0; i < 10; i++) {
    game.move(i % 2 === 0 ? 'right' : 'left')
  }
  
  // i=0:right, i=1:left, ... i=9:left
  // 所以最后在最左边
  assertEqual(game.board[0][0], 2)
})

console.log('\n【测试组32】左右合并边界情况')
console.log('─────────────────────────────────')

test('合并边界', '单个方块左移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 8]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 0, 0, 0])
})

test('合并边界', '单个方块右移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [8, 0, 0, 0]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 8])
})

test('合并边界', '最左方块无法左移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [16, 0, 0, 0]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [16, 0, 0, 0])
})

test('合并边界', '最右方块无法右移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [0, 0, 0, 16]
  
  const result = game.move('right')
  
  assertFalse(result.moved)
  assertEqual(game.board[0], [0, 0, 0, 16])
})

test('合并边界', '全满不同值无法左移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const result = game.move('left')
  
  assertFalse(result.moved)
})

test('合并边界', '全满不同值无法右移', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 16]
  
  const result = game.move('right')
  
  assertFalse(result.moved)
})

test('合并边界', '连续相同值左移合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 4, 4, 4]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 8, 0, 0])
  assertEqual(game.score, 16)
})

test('合并边界', '连续相同值右移合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 4, 4, 4]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 8, 8])
  assertEqual(game.score, 16)
})

console.log('\n【测试组33】特殊右移合并问题')
console.log('─────────────────────────────────')

test('特殊右移', '4 16 2 2右移应合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 16, 2, 2]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 4, 16, 4])
  assertEqual(game.score, 4)
})

test('特殊右移', '2 4 8 8右移应合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 4, 8, 8]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 2, 4, 16])
  assertEqual(game.score, 16)
})

test('特殊右移', '4 4 2 2右移应双合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 4, 2, 2]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 0, 8, 4])
  assertEqual(game.score, 12)
})

test('特殊右移', '验证动画数据正确性', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 16, 2, 2]
  
  const result = game.move('right')
  
  // 应该有4个动画：4移动，16移动，两个2合并
  assertEqual(result.moveAnimations.length, 4)
  
  // 检查合并标记
  const mergedCount = result.moveAnimations.filter(a => a.merged).length
  assertTrue(mergedCount >= 1)
})

test('特殊右移', '8 2 2 4右移验证', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [8, 2, 2, 4]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 8, 4, 4])
  assertEqual(game.score, 4)
})

console.log('\n【测试组34】特殊左移合并问题')
console.log('─────────────────────────────────')

test('特殊左移', '2 2 4 2左移应合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 4, 2]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [4, 4, 2, 0])
  assertEqual(game.score, 4)
})

test('特殊左移', '2 2 2 4左移应合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 2, 4]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [4, 2, 4, 0])
  assertEqual(game.score, 4)
})

test('特殊左移', '4 2 2 8左移应合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 2, 2, 8]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [4, 4, 8, 0])
  assertEqual(game.score, 4)
})

test('特殊左移', '验证合并位置的动画数据', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 2, 4, 2]
  
  const result = game.move('left')
  
  // 应该有4个动画
  assertEqual(result.moveAnimations.length, 4)
  
  // 检查第一个位置的合并
  const position0Anims = result.moveAnimations.filter(a => a.to.col === 0)
  assertEqual(position0Anims.length, 2)
  
  // 两个都应该标记为merged
  const mergedCount = position0Anims.filter(a => a.merged).length
  assertEqual(mergedCount, 2)
})

test('特殊左移', '8 8 4 4左移双合并', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [8, 8, 4, 4]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [16, 8, 0, 0])
  assertEqual(game.score, 24)
})

console.log('\n【测试组35】特殊间隔合并问题')
console.log('─────────────────────────────────')

test('间隔合并', '4 8 0 4右移不能合并（有阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 8, 0, 4]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 4, 8, 4])
  assertEqual(game.score, 0)
})

test('间隔合并', '2 0 4 2左移不合并（有阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 4, 2]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [2, 4, 2, 0])
  assertEqual(game.score, 0)
})

test('间隔合并', '2 0 0 2右移应合并（无阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 0, 2]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 0, 0, 4])
  assertEqual(game.score, 4)
})

test('间隔合并', '4 0 4 8右移应合并（无阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [4, 0, 4, 8]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 0, 8, 8])
  assertEqual(game.score, 8)
})

test('间隔合并', '2 0 2 0左移应合并（无阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [2, 0, 2, 0]
  
  const result = game.move('left')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [4, 0, 0, 0])
  assertEqual(game.score, 4)
})

test('间隔合并', '8 4 0 4右移应合并（无阻挡）', () => {
  const game = new GameManager({ testMode: true })
  game.initBoard()
  game.board[0] = [8, 4, 0, 4]
  
  const result = game.move('right')
  
  assertTrue(result.moved)
  assertEqual(game.board[0], [0, 0, 8, 8])
  assertEqual(game.score, 8)
})

// ═══════════════════════════════════════════════════════════
// 测试结果报告
// ═══════════════════════════════════════════════════════════

console.log('\n╔════════════════════════════════════════╗')
console.log('║            测试结果统计                ║')
console.log('╚════════════════════════════════════════╝')
console.log(`总测试数: ${totalTests}`)
console.log(`✓ 通过:   ${passedTests}`)
console.log(`✗ 失败:   ${failedTests}`)
console.log(`通过率:   ${((passedTests / totalTests) * 100).toFixed(1)}%`)

if (failures.length > 0) {
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║            失败测试详情                ║')
  console.log('╚════════════════════════════════════════╝')
  
  let currentCategory = ''
  failures.forEach(({ category, name, error }) => {
    if (category !== currentCategory) {
      console.log(`\n【${category}】`)
      currentCategory = category
    }
    console.log(`  ✗ ${name}`)
    console.log(`    ${error}`)
  })
  
  console.log('\n测试失败! 请修复上述问题。\n')
  process.exit(1)
} else {
  console.log('\n✓ 所有测试通过! 游戏逻辑正常工作。\n')
  process.exit(0)
}
