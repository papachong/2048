// 游戏核心逻辑管理器
export class GameManager {
  constructor() {
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

    return { moved, tiles, merges: this.findMerges(oldBoard), moveAnimations }
  }

  moveLeft(moveAnimations) {
    let moved = false
    for (let row = 0; row < this.boardSize; row++) {
      const originalRow = [...this.board[row]]
      const { line, moves } = this.mergeLine(originalRow, 'left')
      this.board[row] = line
      if (!this.arraysEqual(originalRow, this.board[row])) {
        moved = true
        moves.forEach(m => {
          m.from.forEach(src => {
            moveAnimations.push({
              from: { row, col: src },
              to: { row, col: m.to },
              value: originalRow[src],
              merged: m.merged,
              resultValue: m.resultValue
            })
          })
        })
      }
    }
    return moved
  }

  moveRight(moveAnimations) {
    let moved = false
    for (let row = 0; row < this.boardSize; row++) {
      const originalRow = [...this.board[row]]
      const { line, moves } = this.mergeLine(originalRow, 'right')
      this.board[row] = line
      if (!this.arraysEqual(originalRow, this.board[row])) {
        moved = true
        moves.forEach(m => {
          m.from.forEach(src => {
            moveAnimations.push({
              from: { row, col: src },
              to: { row, col: m.to },
              value: originalRow[src],
              merged: m.merged,
              resultValue: m.resultValue
            })
          })
        })
      }
    }
    return moved
  }

  moveUp(moveAnimations) {
    let moved = false
    for (let col = 0; col < this.boardSize; col++) {
      const column = []
      for (let row = 0; row < this.boardSize; row++) {
        column.push(this.board[row][col])
      }
      const originalColumn = [...column]
      const { line: mergedColumn, moves } = this.mergeLine(column, 'left')
      for (let row = 0; row < this.boardSize; row++) {
        this.board[row][col] = mergedColumn[row]
      }
      if (!this.arraysEqual(originalColumn, mergedColumn)) {
        moved = true
        moves.forEach(m => {
          m.from.forEach(src => {
            moveAnimations.push({
              from: { row: src, col },
              to: { row: m.to, col },
              value: originalColumn[src],
              merged: m.merged,
              resultValue: m.resultValue
            })
          })
        })
      }
    }
    return moved
  }

  moveDown(moveAnimations) {
    let moved = false
    for (let col = 0; col < this.boardSize; col++) {
      const column = []
      for (let row = 0; row < this.boardSize; row++) {
        column.push(this.board[row][col])
      }
      const originalColumn = [...column]
      const { line: mergedColumn, moves } = this.mergeLine(column, 'right')
      for (let row = 0; row < this.boardSize; row++) {
        this.board[row][col] = mergedColumn[row]
      }
      if (!this.arraysEqual(originalColumn, mergedColumn)) {
        moved = true
        moves.forEach(m => {
          m.from.forEach(src => {
            moveAnimations.push({
              from: { row: src, col },
              to: { row: m.to, col },
              value: originalColumn[src],
              merged: m.merged,
              resultValue: m.resultValue
            })
          })
        })
      }
    }
    return moved
  }

  mergeLine(line, direction) {
    const working = direction === 'right' ? [...line].reverse() : [...line]
    const active = working
      .map((value, index) => ({ value, index }))
      .filter(item => item.value !== 0)
    const result = Array(this.boardSize).fill(0)
    const moves = []
    let target = 0
    let i = 0

    while (i < active.length) {
      const current = active[i]
      if (i < active.length - 1 && current.value === active[i + 1].value) {
        const mergedValue = current.value * 2
        result[target] = mergedValue
        moves.push({
          from: [current.index, active[i + 1].index],
          to: target,
          value: current.value,
          merged: true,
          resultValue: mergedValue
        })
        this.score += mergedValue
        if (mergedValue === 2048 && !this.won) {
          this.won = true
        }
        i += 2
      } else {
        result[target] = current.value
        moves.push({
          from: [current.index],
          to: target,
          value: current.value,
          merged: false,
          resultValue: current.value
        })
        i += 1
      }
      target += 1
    }

    if (direction === 'right') {
      result.reverse()
      moves.forEach(m => {
        m.to = this.boardSize - 1 - m.to
        m.from = m.from.map(idx => this.boardSize - 1 - idx)
      })
    }

    return { line: result, moves }
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
    localStorage.setItem(key, JSON.stringify(gameState))
  }

  loadGame() {
    const key = this.getStorageKey('2048-game-state')
    let saved = localStorage.getItem(key)

    // 兼容旧版未分用户的存档
    if (!saved) {
      saved = localStorage.getItem('2048-game-state')
      if (saved) {
        localStorage.setItem(key, saved)
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
    localStorage.setItem('2048-best-score', this.bestScore.toString())
  }

  loadBestScore() {
    const saved = localStorage.getItem('2048-best-score')
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
    
    localStorage.setItem('2048-leaderboard', JSON.stringify(scores))
  }

  getLeaderboard() {
    const saved = localStorage.getItem('2048-leaderboard')
    return saved ? JSON.parse(saved) : []
  }

  setPlayerName(name) {
    this.playerName = name || '玩家'
    localStorage.setItem('2048-player-name', this.playerName)
  }

  setCurrentUser(name) {
    this.currentUser = name || '玩家'
  }

  getStorageKey(base) {
    const user = encodeURIComponent(this.currentUser || '玩家')
    return `${base}-${user}`
  }

  loadPlayerName() {
    const saved = localStorage.getItem('2048-player-name')
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
