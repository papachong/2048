// 简单的测试运行器 - 不依赖外部测试框架
import { GameManager } from './src/managers/GameManager.js'

console.log('================================')
console.log('2048游戏逻辑测试')
console.log('================================\n')

let testsPassed = 0
let testsFailed = 0
let failedTests = []

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
    testsPassed++
  } catch (error) {
    console.log(`✗ ${name}`)
    console.log(`  错误: ${error.message}`)
    testsFailed++
    failedTests.push({ name, error: error.message })
  }
}

function assertEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}\n  期望: ${JSON.stringify(expected)}\n  实际: ${JSON.stringify(actual)}`
    )
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(message || '期望值为true')
  }
}

function assertFalse(value, message = '') {
  if (value) {
    throw new Error(message || '期望值为false')
  }
}

// ==================== 测试开始 ====================

console.log('测试1: 向左移动和合并')
console.log('-------------------')
test('将方块向左移动', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [0, 2, 0, 0],
    [0, 0, 0, 4],
    [0, 0, 2, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0][0], 2, '第一行方块应该在最左边')
  assertEqual(game.board[1][0], 4, '第二行方块应该在最左边')
  assertEqual(game.board[2][0], 2, '第三行方块应该在最左边')
})

test('向左合并相同方块', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0], '第一行应该合并为4')
  assertEqual(game.board[1], [8, 0, 0, 0], '第二行应该合并为8')
})

test('四个相同方块向左应该合并为两个', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [4, 4, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [8, 8, 0, 0], '应该合并为[8, 8, 0, 0]')
})

console.log('\n测试2: 向右移动和合并')
console.log('-------------------')
test('将方块向右移动', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [4, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('right')
  
  assertEqual(game.board[0][3], 2, '第一行方块应该在最右边')
  assertEqual(game.board[1][3], 4, '第二行方块应该在最右边')
  assertEqual(game.board[2][3], 2, '第三行方块应该在最右边')
})

test('向右合并相同方块', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [0, 0, 2, 2],
    [0, 0, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 0, 4], '第一行应该合并为4在最右边')
  assertEqual(game.board[1], [0, 0, 0, 8], '第二行应该合并为8在最右边')
})

test('四个相同方块向右应该合并为两个', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [4, 4, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('right')
  
  assertEqual(game.board[0], [0, 0, 8, 8], '应该合并为[0, 0, 8, 8]')
})

console.log('\n测试3: 向上移动和合并')
console.log('-------------------')
test('将方块向上移动', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 2, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 2, '第一列方块应该在最上面')
  assertEqual(game.board[0][1], 4, '第二列方块应该在最上面')
  assertEqual(game.board[0][2], 2, '第三列方块应该在最上面')
})

test('向上合并相同方块', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 0, 0],
    [2, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 4, '第一列应该合并为4')
  assertEqual(game.board[0][1], 8, '第二列应该合并为8')
  assertEqual(game.board[1][0], 0, '第二行第一列应该为0')
  assertEqual(game.board[1][1], 0, '第二行第二列应该为0')
})

test('四个相同方块向上应该合并为两个', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0]
  ]
  
  game.move('up')
  
  assertEqual(game.board[0][0], 8, '应该在顶部合并为8')
  assertEqual(game.board[1][0], 8, '应该在第二行合并为8')
  assertEqual(game.board[2][0], 0, '第三行应该为0')
  assertEqual(game.board[3][0], 0, '第四行应该为0')
})

console.log('\n测试4: 向下移动和合并')
console.log('-------------------')
test('将方块向下移动', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 2, '第一列方块应该在最下面')
  assertEqual(game.board[3][1], 4, '第二列方块应该在最下面')
  assertEqual(game.board[3][2], 2, '第三列方块应该在最下面')
})

test('向下合并相同方块', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 4, 0, 0],
    [2, 4, 0, 0]
  ]
  
  game.move('down')
  
  assertEqual(game.board[3][0], 4, '第一列应该合并为4在底部')
  assertEqual(game.board[3][1], 8, '第二列应该合并为8在底部')
  assertEqual(game.board[2][0], 0, '第三行第一列应该为0')
  assertEqual(game.board[2][1], 0, '第三行第二列应该为0')
})

console.log('\n测试5: 分数计算')
console.log('-------------------')
test('合并方块应该增加分数', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 2, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.score, 12, '分数应该是12 (4+8)')
})

test('移动但不合并不应增加分数', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [0, 2, 0, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const initialScore = game.score
  game.move('left')
  
  assertEqual(game.score, initialScore, '分数不应该改变')
})

console.log('\n测试6: 游戏结束判断')
console.log('-------------------')
test('有空格时游戏不应结束', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 4, 8, 0],
    [8, 2, 4, 8]
  ]
  
  assertFalse(game.checkGameOver(), '游戏不应该结束')
})

test('有可合并方块时游戏不应结束', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 4, 8, 16],
    [8, 2, 2, 8]
  ]
  
  assertFalse(game.checkGameOver(), '游戏不应该结束')
})

test('无空格且无可合并方块时游戏应该结束', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 16, 8, 4],
    [8, 2, 4, 8]
  ]
  
  assertTrue(game.checkGameOver(), '游戏应该结束')
  assertTrue(game.gameOver, 'gameOver标志应该为true')
})

console.log('\n测试7: 复杂场景')
console.log('-------------------')
test('三个相同方块应该只合并前两个', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 2, 0, 0], '应该是[4, 2, 0, 0]')
})

test('带间隔的相同方块应该合并', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 0, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 0, 0, 0], '应该合并为[4, 0, 0, 0]')
})

test('混合移动和合并', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 0, 2, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertEqual(game.board[0], [4, 4, 0, 0], '应该是[4, 4, 0, 0]')
})

test('无效移动不应改变棋盘', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  const boardCopy = JSON.parse(JSON.stringify(game.board))
  const result = game.move('left')
  
  assertFalse(result.moved, '不应该移动')
  assertEqual(game.board, boardCopy, '棋盘不应该改变')
})

console.log('\n测试8: 获胜条件')
console.log('-------------------')
test('合并出2048应该获胜', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [1024, 1024, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left')
  
  assertTrue(game.won, '应该获胜')
  assertEqual(game.board[0][0], 2048, '应该有2048方块')
})

console.log('\n测试9: 撤销功能')
console.log('-------------------')
test('应该能撤销上一步操作', () => {
  const game = new GameManager()
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
  
  assertTrue(undoResult, '应该能撤销')
  assertEqual(game.board, boardBefore, '棋盘应该恢复')
  assertEqual(game.score, scoreBefore, '分数应该恢复')
})

test('无效移动不应保存到历史', () => {
  const game = new GameManager()
  game.initBoard()
  game.board = [
    [2, 4, 8, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  game.move('left') // 无法移动
  
  const undoResult = game.undo()
  assertFalse(undoResult, '不应该能撤销')
})

// ==================== 测试结果统计 ====================

console.log('\n================================')
console.log('测试结果')
console.log('================================')
console.log(`通过: ${testsPassed}`)
console.log(`失败: ${testsFailed}`)
console.log(`总计: ${testsPassed + testsFailed}`)

if (failedTests.length > 0) {
  console.log('\n失败的测试:')
  failedTests.forEach(({ name, error }) => {
    console.log(`\n  ${name}`)
    console.log(`    ${error}`)
  })
  process.exit(1)
} else {
  console.log('\n✓ 所有测试通过!')
  process.exit(0)
}
