// Pixi.js 渲染器 - 负责游戏的视觉呈现
import * as PIXI from 'pixi.js'

export class PixiRenderer {
  constructor(container, boardSize = 4) {
    this.container = container
    this.boardSize = boardSize
    this.app = null
    this.tileContainer = null
    this.tiles = {}
    this.animating = false
    
    // 响应式尺寸
    this.updateSizes()
    window.addEventListener('resize', () => this.handleResize())
    
    // 颜色配置
    this.colors = {
      background: 0xbbada0,
      empty: 0xcdc1b4,
      tiles: {
        2: 0xeee4da,
        4: 0xede0c8,
        8: 0xf2b179,
        16: 0xf59563,
        32: 0xf67c5f,
        64: 0xf65e3b,
        128: 0xedcf72,
        256: 0xedcc61,
        512: 0xedc850,
        1024: 0xedc53f,
        2048: 0xedc22e,
        4096: 0x3c3a32
      },
      textColors: {
        2: 0x776e65,
        4: 0x776e65,
        default: 0xf9f6f2
      }
    }
  }

  updateSizes() {
    const maxWidth = Math.min(window.innerWidth - 40, 600)
    const maxHeight = Math.min(window.innerHeight - 200, 600)
    this.gameSize = Math.min(maxWidth, maxHeight)
    
    this.tileSpacing = Math.max(10, this.gameSize * 0.025)
    this.tileSize = (this.gameSize - (this.boardSize + 1) * this.tileSpacing) / this.boardSize
    this.borderRadius = Math.max(5, this.tileSize * 0.05)
  }

  async init() {
    this.app = new PIXI.Application({
      width: this.gameSize,
      height: this.gameSize,
      backgroundColor: this.colors.background,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    this.container.appendChild(this.app.view)
    this.tileContainer = new PIXI.Container()
    this.app.stage.addChild(this.tileContainer)
    
    this.drawEmptyBoard()
  }

  drawEmptyBoard() {
    // 清除旧的空格子
    if (this.emptyTilesContainer) {
      this.app.stage.removeChild(this.emptyTilesContainer)
    }
    
    this.emptyTilesContainer = new PIXI.Container()
    this.app.stage.addChildAt(this.emptyTilesContainer, 0)
    
    // 绘制空格子背景
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const pos = this.getTilePosition(row, col)
        const tile = this.createRoundedRect(
          pos.x, pos.y,
          this.tileSize, this.tileSize,
          this.borderRadius,
          this.colors.empty
        )
        this.emptyTilesContainer.addChild(tile)
      }
    }
  }

  createRoundedRect(x, y, width, height, radius, color) {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(color)
    graphics.drawRoundedRect(0, 0, width, height, radius)
    graphics.endFill()
    graphics.x = x
    graphics.y = y
    return graphics
  }

  getTilePosition(row, col) {
    return {
      x: this.tileSpacing + col * (this.tileSize + this.tileSpacing),
      y: this.tileSpacing + row * (this.tileSize + this.tileSpacing)
    }
  }

  createTile(row, col, value) {
    const container = new PIXI.Container()
    const pos = this.getTilePosition(row, col)
    container.x = pos.x
    container.y = pos.y
    
    // 背景
    const color = this.colors.tiles[value] || this.colors.tiles[4096]
    const bg = this.createRoundedRect(0, 0, this.tileSize, this.tileSize, this.borderRadius, color)
    container.addChild(bg)
    
    // 文字
    const textColor = value <= 4 ? this.colors.textColors[value] : this.colors.textColors.default
    const fontSize = this.getFontSize(value)
    const text = new PIXI.Text(value.toString(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: fontSize,
      fontWeight: 'bold',
      fill: textColor,
      align: 'center'
    })
    text.anchor.set(0.5)
    text.x = this.tileSize / 2
    text.y = this.tileSize / 2
    container.addChild(text)
    
    // 初始缩放为0，用于动画
    container.scale.set(0)
    container.alpha = 0
    
    return container
  }

  getFontSize(value) {
    const baseSize = this.tileSize * 0.4
    if (value < 100) return baseSize
    if (value < 1000) return baseSize * 0.85
    if (value < 10000) return baseSize * 0.7
    return baseSize * 0.6
  }

  async renderBoard(board, options = {}) {
    const { animate = true, newTiles = [], mergedTiles = [], moveAnimations = [] } = options

    if (!this.tileContainer) {
      this.tileContainer = new PIXI.Container()
      this.app.stage.addChild(this.tileContainer)
    }

    if (animate && moveAnimations.length > 0) {
      await this.runMoveAnimations(moveAnimations)
    }

    const nextTiles = {}

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const value = board[row][col]
        if (value === 0) continue

        const tileKey = `${row}-${col}`
        let tile = this.tiles[tileKey]

        if (tile && tile.value !== value) {
          this.tileContainer.removeChild(tile)
          tile.destroy({ children: true })
          tile = null
        }

        if (!tile) {
          tile = this.createTile(row, col, value)
          tile.value = value
          this.tileContainer.addChild(tile)
        } else {
          const pos = this.getTilePosition(row, col)
          tile.x = pos.x
          tile.y = pos.y
        }

        nextTiles[tileKey] = tile

        if (animate) {
          const isNew = newTiles.some(t => t.row === row && t.col === col)
          const isMerged = mergedTiles.some(t => t.row === row && t.col === col)
          if (isNew) {
            await this.animateTileAppear(tile, false)
          } else {
            // merged tiles and unchanged tiles pop in instantly
            tile.scale.set(1)
            tile.alpha = 1
          }
        } else {
          tile.scale.set(1)
          tile.alpha = 1
        }
      }
    }

    // 清理不再需要的旧方块
    Object.entries(this.tiles).forEach(([key, tile]) => {
      if (!nextTiles[key]) {
        this.tileContainer.removeChild(tile)
        tile.destroy({ children: true })
      }
    })

    this.tiles = nextTiles
  }

  async animateTileAppear(tile, isMerged = false) {
    return new Promise(resolve => {
      const duration = isMerged ? 120 : 90
      const targetScale = isMerged ? 1.08 : 1
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        
        tile.scale.set(eased * targetScale)
        tile.alpha = eased
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          if (isMerged) {
            // 合并后轻微回弹
            this.animateBounce(tile).then(resolve)
          } else {
            resolve()
          }
        }
      }
      
      animate()
    })
  }

  async animateBounce(tile) {
    return new Promise(resolve => {
      const duration = 70
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 从1.1回到1
        const scale = 1.1 - (0.1 * progress)
        tile.scale.set(scale)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animate()
    })
  }

  async runMoveAnimations(moveAnimations) {
    const animations = moveAnimations.map(move => this.animateMove(move))
    await Promise.all(animations)

    const updatedTiles = { ...this.tiles }

    moveAnimations.forEach(move => {
      const fromKey = `${move.from.row}-${move.from.col}`
      const toKey = `${move.to.row}-${move.to.col}`
      const tile = this.tiles[fromKey]
      if (!tile) return

      if (move.merged) {
        this.tileContainer.removeChild(tile)
        tile.destroy({ children: true })
        delete updatedTiles[fromKey]
      } else {
        const pos = this.getTilePosition(move.to.row, move.to.col)
        tile.x = pos.x
        tile.y = pos.y
        updatedTiles[toKey] = tile
        delete updatedTiles[fromKey]
      }
    })

    this.tiles = updatedTiles
  }

  createTrail(value) {
    const color = this.colors.tiles[value] || this.colors.tiles[4096]
    const trail = new PIXI.Graphics()
    trail.beginFill(color, 0.35)
    trail.drawRoundedRect(0, 0, this.tileSize, this.tileSize, this.borderRadius)
    trail.endFill()
    trail.alpha = 0.4
    trail.filters = [new PIXI.filters.BlurFilter(6)]
    return trail
  }

  async animateMove(move) {
    const { from, to, value } = move
    const tileKey = `${from.row}-${from.col}`
    const tile = this.tiles[tileKey]
    if (!tile) return

    const fromPos = this.getTilePosition(from.row, from.col)
    const toPos = this.getTilePosition(to.row, to.col)
    const trail = this.createTrail(value)
    this.tileContainer.addChildAt(trail, Math.max(0, this.tileContainer.getChildIndex(tile)))

    return new Promise(resolve => {
      const duration = 140
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 2)

        tile.x = fromPos.x + (toPos.x - fromPos.x) * eased
        tile.y = fromPos.y + (toPos.y - fromPos.y) * eased

        const trailProgress = Math.max(0, eased - 0.2)
        trail.x = fromPos.x + (toPos.x - fromPos.x) * trailProgress
        trail.y = fromPos.y + (toPos.y - fromPos.y) * trailProgress
        trail.alpha = 0.4 * (1 - progress)
        trail.scale.set(1 + 0.05 * (1 - progress))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.tileContainer.removeChild(trail)
          trail.destroy(true)
          resolve()
        }
      }
      
      animate()
    })
  }

  handleResize() {
    this.updateSizes()
    if (this.app) {
      this.app.renderer.resize(this.gameSize, this.gameSize)
      this.drawEmptyBoard()
      // 需要重新渲染当前游戏板
    }
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true, { children: true })
      this.app = null
    }
    window.removeEventListener('resize', () => this.handleResize())
  }
}
