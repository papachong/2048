import { describe, it, expect, beforeEach } from 'vitest'
import { GameManager } from '../src/managers/GameManager.js'

describe('GameManager - 2048游戏逻辑测试', () => {
  let game

  beforeEach(() => {
    game = new GameManager()
    game.initBoard()
  })

  // ==================== 初始化测试 ====================
  describe('初始化', () => {
    it('应该正确初始化游戏板为4x4全0', () => {
      expect(game.board.length).toBe(4)
      expect(game.board.every(row => row.length === 4)).toBe(true)
      expect(game.board.every(row => row.every(cell => cell === 0))).toBe(true)
    })

    it('应该初始化分数为0', () => {
      expect(game.score).toBe(0)
    })

    it('应该初始化游戏状态', () => {
      expect(game.gameOver).toBe(false)
      expect(game.won).toBe(false)
      expect(game.moveCount).toBe(0)
    })
  })

  // ==================== 方块生成测试 ====================
  describe('方块生成', () => {
    it('应该在空位生成2或4', () => {
      const tile = game.spawnRandomTile()
      expect(tile).not.toBeNull()
      expect([2, 4]).toContain(tile.value)
      expect(tile.row).toBeGreaterThanOrEqual(0)
      expect(tile.row).toBeLessThan(4)
      expect(tile.col).toBeGreaterThanOrEqual(0)
      expect(tile.col).toBeLessThan(4)
    })

    it('棋盘满时不应生成新方块', () => {
      // 填满棋盘
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          game.board[i][j] = 2
        }
      }
      const tile = game.spawnRandomTile()
      expect(tile).toBeNull()
    })
  })

  // ==================== 向左移动测试 ====================
  describe('向左移动', () => {
    it('应该将所有方块向左移动', () => {
      game.board = [
        [0, 2, 0, 0],
        [0, 0, 0, 4],
        [0, 0, 2, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0][0]).toBe(2)
      expect(game.board[1][0]).toBe(4)
      expect(game.board[2][0]).toBe(2)
    })

    it('应该正确合并相同的方块', () => {
      game.board = [
        [2, 2, 0, 0],
        [4, 4, 0, 0],
        [2, 2, 2, 2],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([4, 0, 0, 0])
      expect(game.board[1]).toEqual([8, 0, 0, 0])
      expect(game.board[2]).toEqual([4, 4, 0, 0])
    })

    it('应该累加分数', () => {
      game.board = [
        [2, 2, 0, 0],
        [4, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      const initialScore = game.score
      game.move('left')
      
      // 2+2=4, 4+4=8，应该增加12分
      expect(game.score).toBe(initialScore + 12)
    })

    it('方块无法移动时不应改变棋盘', () => {
      game.board = [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      const boardCopy = JSON.parse(JSON.stringify(game.board))
      const result = game.move('left')
      
      expect(result.moved).toBe(false)
      expect(game.board).toEqual(boardCopy)
    })

    it('多个相同方块应该只合并一次', () => {
      game.board = [
        [4, 4, 4, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      // 应该合并为 [8, 8, 0, 0]，而不是 [16, 0, 0, 0]
      expect(game.board[0]).toEqual([8, 8, 0, 0])
    })
  })

  // ==================== 向右移动测试 ====================
  describe('向右移动', () => {
    it('应该将所有方块向右移动', () => {
      game.board = [
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('right')
      
      expect(game.board[0][3]).toBe(2)
      expect(game.board[1][3]).toBe(4)
      expect(game.board[2][3]).toBe(2)
    })

    it('应该正确合并相同的方块', () => {
      game.board = [
        [0, 0, 2, 2],
        [0, 0, 4, 4],
        [2, 2, 2, 2],
        [0, 0, 0, 0]
      ]
      
      game.move('right')
      
      expect(game.board[0]).toEqual([0, 0, 0, 4])
      expect(game.board[1]).toEqual([0, 0, 0, 8])
      expect(game.board[2]).toEqual([0, 0, 4, 4])
    })

    it('多个相同方块应该只合并一次', () => {
      game.board = [
        [4, 4, 4, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('right')
      
      expect(game.board[0]).toEqual([0, 0, 8, 8])
    })
  })

  // ==================== 向上移动测试 ====================
  describe('向上移动', () => {
    it('应该将所有方块向上移动', () => {
      game.board = [
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 2, 0]
      ]
      
      game.move('up')
      
      expect(game.board[0][0]).toBe(2)
      expect(game.board[0][1]).toBe(4)
      expect(game.board[0][2]).toBe(2)
    })

    it('应该正确合并相同的方块', () => {
      game.board = [
        [2, 4, 2, 0],
        [2, 4, 2, 0],
        [0, 0, 2, 0],
        [0, 0, 2, 0]
      ]
      
      game.move('up')
      
      expect(game.board[0]).toEqual([4, 8, 4, 0])
      expect(game.board[1]).toEqual([0, 0, 4, 0])
      expect(game.board[2]).toEqual([0, 0, 0, 0])
      expect(game.board[3]).toEqual([0, 0, 0, 0])
    })

    it('多个相同方块应该只合并一次', () => {
      game.board = [
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0]
      ]
      
      game.move('up')
      
      expect(game.board[0][0]).toBe(8)
      expect(game.board[1][0]).toBe(8)
      expect(game.board[2][0]).toBe(0)
      expect(game.board[3][0]).toBe(0)
    })
  })

  // ==================== 向下移动测试 ====================
  describe('向下移动', () => {
    it('应该将所有方块向下移动', () => {
      game.board = [
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 2, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('down')
      
      expect(game.board[3][0]).toBe(2)
      expect(game.board[3][1]).toBe(4)
      expect(game.board[3][2]).toBe(2)
    })

    it('应该正确合并相同的方块', () => {
      game.board = [
        [0, 0, 2, 0],
        [0, 0, 2, 0],
        [2, 4, 2, 0],
        [2, 4, 2, 0]
      ]
      
      game.move('down')
      
      expect(game.board[3]).toEqual([4, 8, 4, 0])
      expect(game.board[2]).toEqual([0, 0, 4, 0])
      expect(game.board[1]).toEqual([0, 0, 0, 0])
      expect(game.board[0]).toEqual([0, 0, 0, 0])
    })

    it('多个相同方块应该只合并一次', () => {
      game.board = [
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0],
        [4, 0, 0, 0]
      ]
      
      game.move('down')
      
      expect(game.board[3][0]).toBe(8)
      expect(game.board[2][0]).toBe(8)
      expect(game.board[1][0]).toBe(0)
      expect(game.board[0][0]).toBe(0)
    })
  })

  // ==================== 游戏结束检测测试 ====================
  describe('游戏结束检测', () => {
    it('有空格时游戏应该继续', () => {
      game.board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 0],
        [8, 2, 4, 8]
      ]
      
      expect(game.checkGameOver()).toBe(false)
      expect(game.gameOver).toBe(false)
    })

    it('有可合并方块时游戏应该继续', () => {
      game.board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [8, 2, 2, 8]
      ]
      
      expect(game.checkGameOver()).toBe(false)
      expect(game.gameOver).toBe(false)
    })

    it('无空格且无可合并方块时游戏结束', () => {
      game.board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 16, 8, 4],
        [8, 2, 4, 8]
      ]
      
      expect(game.checkGameOver()).toBe(true)
      expect(game.gameOver).toBe(true)
    })
  })

  // ==================== 撤销功能测试 ====================
  describe('撤销功能', () => {
    it('应该能够撤销上一步操作', () => {
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
      
      expect(undoResult).toBe(true)
      expect(game.board).toEqual(boardBefore)
      expect(game.score).toBe(scoreBefore)
    })

    it('没有历史记录时不应能撤销', () => {
      const undoResult = game.undo()
      expect(undoResult).toBe(false)
    })

    it('无效移动不应保存到历史', () => {
      game.board = [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left') // 无法移动
      
      const undoResult = game.undo()
      expect(undoResult).toBe(false)
    })
  })

  // ==================== 获胜检测测试 ====================
  describe('获胜检测', () => {
    it('合并出2048时应该获胜', () => {
      game.board = [
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.won).toBe(true)
      expect(game.board[0][0]).toBe(2048)
    })

    it('未达到2048时不应获胜', () => {
      game.board = [
        [512, 512, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.won).toBe(false)
      expect(game.board[0][0]).toBe(1024)
    })
  })

  // ==================== 边界情况测试 ====================
  describe('边界情况', () => {
    it('单个方块向左移动应该移到最左边', () => {
      game.board = [
        [0, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([2, 0, 0, 0])
    })

    it('连续三个相同方块应该只合并前两个', () => {
      game.board = [
        [2, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([4, 2, 0, 0])
    })

    it('空行移动应该不改变', () => {
      game.board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      const result = game.move('left')
      
      expect(result.moved).toBe(false)
      expect(game.board[0]).toEqual([0, 0, 0, 0])
    })

    it('游戏结束后不应允许移动', () => {
      game.gameOver = true
      game.board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      const result = game.move('left')
      
      expect(result.moved).toBe(false)
    })
  })

  // ==================== 复杂场景测试 ====================
  describe('复杂场景', () => {
    it('应该正确处理混合移动和合并', () => {
      game.board = [
        [2, 0, 2, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([4, 4, 0, 0])
    })

    it('应该正确处理多行同时移动', () => {
      game.board = [
        [0, 2, 0, 2],
        [4, 0, 4, 0],
        [0, 8, 0, 8],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([4, 0, 0, 0])
      expect(game.board[1]).toEqual([8, 0, 0, 0])
      expect(game.board[2]).toEqual([16, 0, 0, 0])
    })

    it('应该正确处理带间隔的合并', () => {
      game.board = [
        [2, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      expect(game.board[0]).toEqual([4, 0, 0, 0])
    })
  })

  // ==================== 分数计算测试 ====================
  describe('分数计算', () => {
    it('应该正确累加合并产生的分数', () => {
      game.board = [
        [2, 2, 4, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      game.move('left')
      
      // 2+2=4(+4分), 4+4=8(+8分)，总共+12分
      expect(game.score).toBe(12)
    })

    it('移动但没有合并不应增加分数', () => {
      game.board = [
        [0, 2, 0, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      
      const initialScore = game.score
      game.move('left')
      
      expect(game.score).toBe(initialScore)
    })
  })
})
