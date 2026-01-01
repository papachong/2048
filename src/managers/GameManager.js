// 游戏核心逻辑管理器
export class GameManager {
  constructor(options = {}) {
    this.boardSize = 4
    this.board = []
    this.score = 0
    this.bestScore = this.loadBestScore()
    this.history = [] // 用于撤销功能
    this.maxHistory = 10
    this.gameOver = false
    this.won = false
    this.moveCount = 0
    this.startTime = null
    this.playerName = this.loadPlayerName()
    this.currentUser = this.playerName || '玩家'
    this.testMode = options.testMode || false // 测试模式：禁用自动生成新方块
  }

  // LocalStorage兼容层（支持Node.js测试环境）
  getStorage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
    // Node.js环境的fallback
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  }

  // 初始化游戏板
  initBoard() {
    this.board = []
    for (let row = 0; row < this.boardSize; row++) {
      this.board[row] = []
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col] = 0
      }
    }
    this.score = 0
    this.gameOver = false
    this.won = false
    this.moveCount = 0
    this.startTime = Date.now()
    this.history = []
  }

  // 保存当前状态到历史
  saveToHistory() {
    this.history.push({
      board: JSON.parse(JSON.stringify(this.board)),
      score: this.score,
      moveCount: this.moveCount
    })
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  // 撤销上一步
  undo() {
    if (this.history.length === 0) return false
    
    const lastState = this.history.pop()
    this.board = lastState.board
    this.score = lastState.score
    this.moveCount = lastState.moveCount
    this.gameOver = false
    
    return true
  }

  // 生成随机方块
  spawnRandomTile() {
    const emptyCells = []
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === 0) {
          emptyCells.push({ row, col })
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const value = Math.random() < 0.9 ? 2 : 4
      this.board[randomCell.row][randomCell.col] = value
      return { ...randomCell, value, isNew: true }
    }
    return null
  }

  // 移动方向
  move(direction) {
    if (this.gameOver) return { moved: false, tiles: [], moveAnimations: [] }
    
    this.saveToHistory()
    const oldBoard = JSON.parse(JSON.stringify(this.board))
    const tiles = []
    const moveAnimations = []
    let moved = false

    switch (direction) {
      case 'left':
        moved = this.moveLeft(moveAnimations)
        break
      case 'right':
        moved = this.moveRight(moveAnimations)
        break
      case 'up':
        moved = this.moveUp(moveAnimations)
        break
      case 'down':
        moved = this.moveDown(moveAnimations)
        break
    }

    if (moved) {
      this.moveCount++
      // 测试模式下不自动生成新方块
      if (!this.testMode) {
        const newTile = this.spawnRandomTile()
        if (newTile) tiles.push(newTile)
      }
      
      if (this.score > this.bestScore) {
        this.bestScore = this.score
        this.saveBestScore()
      }
      
      this.checkGameOver()
    } else {
      this.history.pop() // 没有移动则撤销保存
    }

    // 从动画数据中提取真正的合并位置
    const merges = this.extractMergesFromAnimations(moveAnimations)
    
    return { moved, tiles, merges, moveAnimations }
  }

  // ==================== 核心移动算法 ====================
  
  /**
   * 向左移动
   * 每行从左到右处理，方块向左滑动并合并
   */
  moveLeft(moveAnimations) {
    let moved = false
    for (let row = 0; row < this.boardSize; row++) {
      const result = this.slideAndMerge(this.board[row], row, 'row', 'left', moveAnimations)
      if (result.moved) {
        this.board[row] = result.line
        moved = true
      }
    }
    return moved
  }

  /**
   * 向右移动
   * 每行从右到左处理，方块向右滑动并合并
   */
  moveRight(moveAnimations) {
    let moved = false
    for (let row = 0; row < this.boardSize; row++) {
      const result = this.slideAndMerge(this.board[row], row, 'row', 'right', moveAnimations)
      if (result.moved) {
        this.board[row] = result.line
        moved = true
      }
    }
    return moved
  }

  /**
   * 向上移动
   * 每列从上到下处理，方块向上滑动并合并
   */
  moveUp(moveAnimations) {
    let moved = false
    for (let col = 0; col < this.boardSize; col++) {
      // 提取列数据
      const column = []
      for (let row = 0; row < this.boardSize; row++) {
        column.push(this.board[row][col])
      }
      const result = this.slideAndMerge(column, col, 'col', 'left', moveAnimations)
      if (result.moved) {
        // 写回列数据
        for (let row = 0; row < this.boardSize; row++) {
          this.board[row][col] = result.line[row]
        }
        moved = true
      }
    }
    return moved
  }

  /**
   * 向下移动
   * 每列从下到上处理，方块向下滑动并合并
   */
  moveDown(moveAnimations) {
    let moved = false
    for (let col = 0; col < this.boardSize; col++) {
      // 提取列数据
      const column = []
      for (let row = 0; row < this.boardSize; row++) {
        column.push(this.board[row][col])
      }
      const result = this.slideAndMerge(column, col, 'col', 'right', moveAnimations)
      if (result.moved) {
        // 写回列数据
        for (let row = 0; row < this.boardSize; row++) {
          this.board[row][col] = result.line[row]
        }
        moved = true
      }
    }
    return moved
  }

  /**
   * 核心算法：滑动并合并一行/列
   * 
   * 算法步骤：
   * 1. 提取所有非零方块，保留原始位置信息
   * 2. 根据方向决定处理顺序和放置位置
   * 3. 相邻相同值合并（每个方块每次移动最多合并一次）
   * 4. 将结果放置到目标边缘
   * 
   * @param {number[]} line - 原始行/列数据
   * @param {number} lineIndex - 行号或列号
   * @param {string} type - 'row' 或 'col'
   * @param {string} direction - 'left' 或 'right'（left也用于up，right也用于down）
   * @param {Array} moveAnimations - 动画数据收集数组
   * @returns {{line: number[], moved: boolean}}
   */
  slideAndMerge(line, lineIndex, type, direction, moveAnimations) {
    const size = this.boardSize
    const originalLine = [...line]
    
    // 步骤1：提取非零方块及其原始索引
    const tiles = []
    for (let i = 0; i < size; i++) {
      if (line[i] !== 0) {
        tiles.push({ value: line[i], originalPos: i })
      }
    }
    
    // 如果没有方块，无需处理
    if (tiles.length === 0) {
      return { line: originalLine, moved: false }
    }
    
    // 步骤2：处理合并
    // 向左/上：从左往右合并
    // 向右/下：从右往左合并
    const merged = []
    
    if (direction === 'left') {
      // 从左往右处理
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
          // 更新分数
          this.score += newValue
          // 检查是否获胜
          if (newValue === 2048 && !this.won) {
            this.won = true
          }
          i += 2 // 跳过两个方块
        } else {
          // 不合并，保留原值
          merged.push({
            value: current.value,
            sources: [current.originalPos],
            isMerged: false
          })
          i += 1
        }
      }
    } else {
      // 从右往左处理（从数组末尾开始）
      let i = tiles.length - 1
      while (i >= 0) {
        const current = tiles[i]
        // 检查是否可以与前一个方块合并
        if (i - 1 >= 0 && tiles[i - 1].value === current.value) {
          // 合并！
          const newValue = current.value * 2
          merged.unshift({  // 添加到数组开头
            value: newValue,
            sources: [tiles[i - 1].originalPos, current.originalPos],
            isMerged: true
          })
          // 更新分数
          this.score += newValue
          // 检查是否获胜
          if (newValue === 2048 && !this.won) {
            this.won = true
          }
          i -= 2 // 跳过两个方块
        } else {
          // 不合并，保留原值
          merged.unshift({  // 添加到数组开头
            value: current.value,
            sources: [current.originalPos],
            isMerged: false
          })
          i -= 1
        }
      }
    }
    
    // 步骤3：构建结果数组，放置到目标边缘
    const result = Array(size).fill(0)
    
    if (direction === 'left') {
      // 结果从索引0开始放置
      for (let j = 0; j < merged.length; j++) {
        result[j] = merged[j].value
        merged[j].targetPos = j
      }
    } else {
      // 结果从末尾开始放置
      for (let j = 0; j < merged.length; j++) {
        const targetPos = size - merged.length + j
        result[targetPos] = merged[j].value
        merged[j].targetPos = targetPos
      }
    }
    
    // 检查是否有变化
    const moved = !this.arraysEqual(originalLine, result)
    
    // 步骤4：生成动画数据
    if (moved) {
      for (const item of merged) {
        for (const srcPos of item.sources) {
          const animation = {
            value: originalLine[srcPos],
            merged: item.isMerged,
            resultValue: item.value
          }
          
          if (type === 'row') {
            animation.from = { row: lineIndex, col: srcPos }
            animation.to = { row: lineIndex, col: item.targetPos }
          } else {
            animation.from = { row: srcPos, col: lineIndex }
            animation.to = { row: item.targetPos, col: lineIndex }
          }
          
          moveAnimations.push(animation)
        }
      }
    }
    
    return { line: result, moved }
  }

  /**
   * 从动画数据中提取真正的合并位置
   * 只有标记为merged的目标位置才是真正的合并
   */
  extractMergesFromAnimations(moveAnimations) {
    const mergePositions = new Map()
    
    // 遍历所有动画，找出合并动画的目标位置
    moveAnimations.forEach(anim => {
      if (anim.merged) {
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

  findMerges(oldBoard) {
    const merges = []
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] !== oldBoard[row][col] && this.board[row][col] > oldBoard[row][col]) {
          merges.push({ row, col, value: this.board[row][col] })
        }
      }
    }
    return merges
  }

  checkGameOver() {
    // 检查是否还有空格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === 0) {
          return false
        }
      }
    }

    // 检查是否还能合并
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const current = this.board[row][col]
        if (col < this.boardSize - 1 && current === this.board[row][col + 1]) {
          return false
        }
        if (row < this.boardSize - 1 && current === this.board[row + 1][col]) {
          return false
        }
      }
    }

    this.gameOver = true
    this.saveScore()
    return true
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, idx) => val === b[idx])
  }

  // 保存/加载游戏状态
  saveGame() {
    const key = this.getStorageKey('2048-game-state')
    const gameState = {
      board: this.board,
      score: this.score,
      moveCount: this.moveCount,
      startTime: this.startTime,
      timestamp: Date.now()
    }
    this.getStorage().setItem(key, JSON.stringify(gameState))
  }

  loadGame() {
    const key = this.getStorageKey('2048-game-state')
    const storage = this.getStorage()
    let saved = storage.getItem(key)

    // 兼容旧版未分用户的存档
    if (!saved) {
      saved = storage.getItem('2048-game-state')
      if (saved) {
        storage.setItem(key, saved)
      }
    }

    if (saved) {
      const gameState = JSON.parse(saved)
      this.board = gameState.board
      this.score = gameState.score
      this.moveCount = gameState.moveCount || 0
      this.startTime = gameState.startTime || Date.now()
      this.gameOver = false
      this.history = []
      return true
    }
    return false
  }

  // 最佳分数
  saveBestScore() {
    this.getStorage().setItem('2048-best-score', this.bestScore.toString())
  }

  loadBestScore() {
    const saved = this.getStorage().getItem('2048-best-score')
    return saved ? parseInt(saved) : 0
  }

  // 保存成绩到排行榜
  saveScore() {
    const scores = this.getLeaderboard()
    const newScore = {
      score: this.score,
      moves: this.moveCount,
      time: Math.floor((Date.now() - this.startTime) / 1000),
      date: new Date().toISOString(),
      name: this.playerName || '玩家'
    }
    
    scores.push(newScore)
    scores.sort((a, b) => b.score - a.score)
    scores.splice(10) // 只保留前10名
    
    this.getStorage().setItem('2048-leaderboard', JSON.stringify(scores))
  }

  getLeaderboard() {
    const saved = this.getStorage().getItem('2048-leaderboard')
    return saved ? JSON.parse(saved) : []
  }

  setPlayerName(name) {
    this.playerName = name || '玩家'
    this.getStorage().setItem('2048-player-name', this.playerName)
  }

  setCurrentUser(name) {
    this.currentUser = name || '玩家'
  }

  getStorageKey(base) {
    const user = encodeURIComponent(this.currentUser || '玩家')
    return `${base}-${user}`
  }

  loadPlayerName() {
    const saved = this.getStorage().getItem('2048-player-name')
    return saved || '玩家'
  }

  // 获取游戏统计
  getStats() {
    return {
      score: this.score,
      bestScore: this.bestScore,
      moves: this.moveCount,
      time: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      canUndo: this.history.length > 0
    }
  }

  // 新游戏
  newGame() {
    this.initBoard()
    this.spawnRandomTile()
    this.spawnRandomTile()
    return this.board
  }
}
