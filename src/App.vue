<template>
  <div class="game-app">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="hero-profile" @click="promptName" title="编辑用户名">
        <div class="hero-avatar">👤</div>
        <div class="hero-text">
          <div class="hero-label">玩家</div>
          <div class="hero-name">{{ playerName }}</div>
        </div>
      </div>
      <div class="scores">
        <div class="score-box">
          <div class="score-label">分数</div>
          <div class="score-value">{{ score }}</div>
        </div>
        <div class="score-box">
          <div class="score-label">最高</div>
          <div class="score-value">{{ bestScore }}</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button class="btn btn-primary" @click="newGame" title="新游戏">🎮</button>
      <button class="btn btn-secondary" @click="undo" :disabled="!canUndo" title="撤销">↩️</button>
      <button class="btn btn-secondary" @click="saveGame" title="保存游戏">💾</button>
      <button class="btn btn-secondary" @click="loadGame" title="加载游戏">📂</button>
      <button class="btn btn-secondary" @click="showLeaderboard = true" title="排行榜">🏆</button>
      <button class="btn btn-secondary" @click="toggleSound" :title="soundEnabled ? '关闭音效' : '开启音效'">
        {{ soundEnabled ? '🔊' : '🔇' }}
      </button>
      <button class="btn btn-secondary" @click="logout" :disabled="!currentUser" title="退出登录">🚪</button>
    </div>

    <!-- 烟花层 -->
    <div class="fireworks-layer" ref="fireworksLayer"></div>

    <!-- 游戏画布容器 -->
    <div 
      ref="gameCanvas" 
      class="game-canvas"
      @touchstart.prevent="handleTouchStart" 
      @touchmove.prevent="handleTouchMove" 
      @touchend.prevent="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    ></div>

    <!-- 游戏结束遮罩 -->
    <transition name="fade">
      <div v-if="gameOver" class="game-over-overlay">
        <div class="game-over-content">
          <h2>{{ won ? '🎉 恭喜获胜！' : '游戏结束' }}</h2>
          <p class="final-score">最终分数: {{ score }}</p>
          <p class="final-moves">移动次数: {{ moveCount }}</p>
          <button class="btn btn-primary" type="button" @click.stop="handleRestart">再来一局</button>
        </div>
      </div>
    </transition>

    <!-- 排行榜 -->
    <Leaderboard 
      v-if="showLeaderboard" 
      :leaderboard="leaderboard"
      @close="showLeaderboard = false"
    />

    <!-- 登录 / 注册弹窗 -->
    <transition name="fade">
      <div v-if="showLogin" class="modal-overlay">
        <div class="modal">
          <h3 class="modal-title">登录 / 注册</h3>
          <p class="modal-desc">首次输入的用户名会自动注册，用户名不可重复。</p>
          <form class="modal-form" @submit.prevent="handleLogin">
            <label class="modal-label">
              用户名
              <input v-model="loginForm.username" type="text" placeholder="请输入用户名" />
            </label>
            <label class="modal-label">
              密码
              <input v-model="loginForm.password" type="password" placeholder="请输入密码" />
            </label>
            <p v-if="loginError" class="modal-error">{{ loginError }}</p>
            <button class="btn btn-primary modal-submit" type="submit">立即进入</button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { GameManager } from './managers/GameManager'
import { PixiRenderer } from './managers/PixiRenderer'
import { SoundManager } from './managers/SoundManager'
import Leaderboard from './components/Leaderboard.vue'

export default {
  name: 'App',
  components: {
    Leaderboard
  },
  setup() {
    const gameCanvas = ref(null)
    const score = ref(0)
    const bestScore = ref(0)
    const moveCount = ref(0)
    const gameTime = ref(0)
    const canUndo = ref(false)
    const gameOver = ref(false)
    const won = ref(false)
    const showLeaderboard = ref(false)
    const soundEnabled = ref(true)
    const leaderboard = ref([])
    const playerName = ref('玩家')
    const currentUser = ref(null)
    const showLogin = ref(false)
    const loginError = ref('')
    const loginForm = ref({ username: '', password: '' })
    const fireworksLayer = ref(null)

    let gameManager = null
    let renderer = null
    let soundManager = null
    let gameTimer = null
    let touchStartX = 0
    let touchStartY = 0
    let mouseStartX = 0
    let mouseStartY = 0
    let isDragging = false

    const USERS_KEY = '2048-users'
    const SESSION_KEY = '2048-auth-session'

    const loadUsers = () => {
      try {
        const saved = localStorage.getItem(USERS_KEY)
        return saved ? JSON.parse(saved) : []
      } catch (err) {
        console.warn('Failed to load users', err)
        return []
      }
    }

    const saveUsers = (users) => {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }

    const loadSession = () => {
      try {
        const saved = localStorage.getItem(SESSION_KEY)
        return saved ? JSON.parse(saved) : null
      } catch (err) {
        console.warn('Failed to load session', err)
        return null
      }
    }

    const saveSession = (username) => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username }))
    }

    const applyUser = (username) => {
      currentUser.value = { username }
      playerName.value = username
      gameManager.setPlayerName(username)
      gameManager.setCurrentUser(username)
      leaderboard.value = gameManager.getLeaderboard()
    }

    const ensureSession = () => {
      const session = loadSession()
      const users = loadUsers()
      if (session && users.some(u => u.username === session.username)) {
        applyUser(session.username)
        return true
      }
      return false
    }

    const migrateLegacyUser = () => {
      // 如果之前版本只存了玩家名，没有用户体系，则自动创建账号并保持排行榜数据
      const legacyName = gameManager?.playerName || localStorage.getItem('2048-player-name')
      if (!legacyName || legacyName === '玩家') return

      const users = loadUsers()
      const exists = users.some(u => u.username === legacyName)
      if (!exists) {
        users.push({ username: legacyName, password: legacyName })
        saveUsers(users)
      }
      saveSession(legacyName)
      applyUser(legacyName)
    }

    const handleLogin = () => {
      const username = (loginForm.value.username || '').trim()
      const password = (loginForm.value.password || '').trim()

      if (!username || !password) {
        loginError.value = '请输入用户名和密码'
        return
      }

      const users = loadUsers()
      const existing = users.find(u => u.username === username)

      if (existing) {
        if (existing.password !== password) {
          loginError.value = '密码不正确'
          return
        }
      } else {
        users.push({ username, password })
        saveUsers(users)
      }

      saveSession(username)
      applyUser(username)
      loginError.value = ''
      showLogin.value = false
    }

    const logout = () => {
      localStorage.removeItem(SESSION_KEY)
      currentUser.value = null
      playerName.value = '玩家'
      gameManager.setPlayerName('玩家')
      gameManager.setCurrentUser('玩家')
      leaderboard.value = gameManager.getLeaderboard()
      showLogin.value = true
    }

    const updateStats = () => {
      const stats = gameManager.getStats()
      score.value = stats.score
      bestScore.value = stats.bestScore
      moveCount.value = stats.moves
      gameTime.value = stats.time
      canUndo.value = stats.canUndo
      gameOver.value = gameManager.gameOver
      won.value = gameManager.won
      leaderboard.value = gameManager.getLeaderboard()
      playerName.value = gameManager.playerName || '玩家'
    }

    const renderGame = async (options = {}) => {
      if (renderer) {
        await renderer.renderBoard(gameManager.board, options)
        updateStats()
      }
    }

    const newGame = async () => {
      gameManager.newGame()
      gameOver.value = false
      won.value = false
      await renderGame({ animate: true, newTiles: [
        { row: 0, col: 0 }, { row: 0, col: 1 }
      ]})
      soundManager.play('spawn')
    }

    const handleRestart = async () => {
      await newGame()
    }

    const promptName = () => {
      const input = window.prompt('请输入用户名（用于排行榜展示）', playerName.value)
      const cleaned = (input || '').trim()
      if (cleaned) {
        playerName.value = cleaned
        gameManager.setPlayerName(cleaned)
        leaderboard.value = gameManager.getLeaderboard()
      }
    }

    const undo = async () => {
      if (gameManager.undo()) {
        await renderGame({ animate: false })
        soundManager.play('move')
      }
    }

    const saveGame = () => {
      gameManager.saveGame()
      alert('游戏已保存！')
    }

    const loadGame = async () => {
      if (gameManager.loadGame()) {
        await renderGame({ animate: false })
        alert('游戏已加载！')
      } else {
        alert('没有保存的游戏')
      }
    }

    const toggleSound = () => {
      soundEnabled.value = soundManager.toggle()
    }

    const createFireworkBurst = () => {
      const layer = fireworksLayer.value || document.querySelector('.fireworks-layer')
      if (!layer) {
        console.warn('Fireworks layer not found')
        return
      }
      const burst = document.createElement('div')
      burst.className = 'firework'
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const x = Math.random() * viewportWidth
      const y = Math.random() * (viewportHeight * 0.6)
      burst.style.left = `${x}px`
      burst.style.top = `${y}px`

      const colors = ['#ffdd57', '#ff7b72', '#7bdff2', '#c3f584', '#f5a623', '#9b8cde']
      const particles = 20
      for (let i = 0; i < particles; i++) {
        const p = document.createElement('span')
        p.className = 'firework-particle'
        const color = colors[Math.floor(Math.random() * colors.length)]
        const angle = (360 / particles) * i
        const rad = (angle * Math.PI) / 180
        const distance = 60 + Math.random() * 40
        const tx = Math.cos(rad) * distance
        const ty = Math.sin(rad) * distance
        p.style.setProperty('--hue', color)
        p.style.setProperty('--tx', `${tx}px`)
        p.style.setProperty('--ty', `${ty}px`)
        burst.appendChild(p)
      }

      layer.appendChild(burst)
      setTimeout(() => burst.remove(), 1200)
    }

    const triggerFireworks = (count = 3) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => createFireworkBurst(), i * 180)
      }
    }

    const handleMove = async (direction) => {
      if (gameOver.value || gameManager.animating) return
      if (soundManager && soundManager.unlock) {
        soundManager.unlock()
      }

      const result = gameManager.move(direction)
      if (result.moved) {
        soundManager.play('move')
        await renderGame({ 
          animate: true, 
          newTiles: result.tiles.filter(t => t.isNew),
          mergedTiles: result.merges,
          moveAnimations: result.moveAnimations
        })
        
        if (result.merges.length > 0) {
          soundManager.play('merge')
        }
        
        if (gameManager.won && !won.value) {
          won.value = true
          soundManager.play('win')
          triggerFireworks(4 + Math.floor(Math.random() * 3))
        }
        
        if (gameManager.gameOver) {
          gameOver.value = true
          soundManager.play('gameOver')
        }
      }
    }

    const handleKeyDown = (e) => {
      // Ignore when typing in inputs/textareas/contenteditable to allow letters like 'a'
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : ''
      const isTyping = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable
      if (isTyping) return

      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
      }
      
      const direction = keyMap[e.key]
      if (direction) {
        e.preventDefault()
        handleMove(direction)
      }
    }

    const handleMouseDown = (e) => {
      // 只处理游戏画布区域内的鼠标事件，避免点击按钮触发拖动
      if (!e.target.closest('.game-canvas')) return
      isDragging = true
      mouseStartX = e.clientX
      mouseStartY = e.clientY
      console.log('Mouse down:', mouseStartX, mouseStartY)
    }

    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault()
      }
    }

    const handleMouseUp = (e) => {
      if (!isDragging) return
      isDragging = false

      const mouseEndX = e.clientX
      const mouseEndY = e.clientY

      const diffX = mouseEndX - mouseStartX
      const diffY = mouseEndY - mouseStartY

      console.log('Mouse up - diff:', diffX, diffY)

      const minSwipeDistance = 30
      const absDiffX = Math.abs(diffX)
      const absDiffY = Math.abs(diffY)

      if (absDiffX > minSwipeDistance || absDiffY > minSwipeDistance) {
        let direction = ''
        if (absDiffX > absDiffY) {
          direction = diffX > 0 ? 'right' : 'left'
        } else {
          direction = diffY > 0 ? 'down' : 'up'
        }
        console.log('Mouse move direction:', direction)
        handleMove(direction)
      }

      mouseStartX = 0
      mouseStartY = 0
    }

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      console.log('Touch start:', touchStartX, touchStartY)
    }

    const handleTouchMove = (e) => {
      // 阻止默认的滚动行为
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (touchStartX === 0 && touchStartY === 0) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const diffX = touchEndX - touchStartX
      const diffY = touchEndY - touchStartY

      console.log('Touch end - diff:', diffX, diffY)

      const minSwipeDistance = 20

      const absDiffX = Math.abs(diffX)
      const absDiffY = Math.abs(diffY)

      if (absDiffX > minSwipeDistance || absDiffY > minSwipeDistance) {
        let direction = ''
        if (absDiffX > absDiffY) {
          // 水平滑动
          direction = diffX > 0 ? 'right' : 'left'
        } else {
          // 垂直滑动
          direction = diffY > 0 ? 'down' : 'up'
        }
        console.log('Move direction:', direction)
        handleMove(direction)
      }

      touchStartX = 0
      touchStartY = 0
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    onMounted(async () => {
      // 初始化管理器
      gameManager = new GameManager()
      soundManager = new SoundManager()
      soundEnabled.value = soundManager.enabled
      playerName.value = gameManager.playerName || '玩家'
      gameManager.setCurrentUser(playerName.value)

      // 处理登录状态
      migrateLegacyUser()
      if (!ensureSession()) {
        showLogin.value = true
      }
      
      // 初始化渲染器
      renderer = new PixiRenderer(gameCanvas.value)
      await renderer.init()
      
      // 开始新游戏
      await newGame()
      
      // 添加键盘事件
      window.addEventListener('keydown', handleKeyDown)
      
      // 开始计时器
      gameTimer = setInterval(() => {
        if (!gameOver.value && gameManager.startTime) {
          gameTime.value = Math.floor((Date.now() - gameManager.startTime) / 1000)
        }
      }, 1000)

      // 测试烟花效果
      setTimeout(() => triggerFireworks(5), 500)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gameTimer) clearInterval(gameTimer)
      if (renderer) renderer.destroy()
    })

    return {
      gameCanvas,
      score,
      bestScore,
      moveCount,
      gameTime,
      canUndo,
      gameOver,
      won,
      showLeaderboard,
      soundEnabled,
      leaderboard,
      newGame,
      undo,
      saveGame,
      loadGame,
      toggleSound,
      playerName,
      currentUser,
      showLogin,
      loginForm,
      loginError,
      handleLogin,
      logout,
      promptName,
      handleRestart,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      formatTime
    }
  }
}
</script>

<style scoped>
.game-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 600px;
  padding: 20px;
  cursor: default;
  user-select: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 560px;
  flex-wrap: wrap;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(6px);
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: none;
}

.hero-profile {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.35), rgba(118, 75, 162, 0.35));
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  cursor: pointer;
  min-width: 160px;
}

.hero-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: grid;
  place-items: center;
  font-size: 22px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.hero-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.6px;
}

.hero-name {
  font-size: 18px;
  font-weight: 800;
  color: #f5f7ff;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scores {
  display: flex;
  gap: 8px;
}

.score-box {
  background: transparent;
  backdrop-filter: none;
  padding: 6px 10px;
  border-radius: 10px;
  text-align: center;
  min-width: 68px;
  border: none;
  box-shadow: none;
}

.score-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  margin-bottom: 2px;
  font-weight: 600;
  letter-spacing: 0.8px;
}

.score-value {
  font-size: clamp(16px, 4vw, 22px);
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}


.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  padding: 4px 0 8px;
  background: transparent;
  box-shadow: none;
}

.fireworks-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1500;
}

.firework {
  position: absolute;
  width: 4px;
  height: 4px;
  transform: translate(-50%, -50%);
}

.firework-particle {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--hue, #ffdd57);
  opacity: 0.9;
  box-shadow: 0 0 4px var(--hue, #ffdd57);
  animation: firework-burst 1s ease-out forwards;
}

@keyframes firework-burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
    opacity: 0;
  }
}

.controls .btn {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  font-size: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(112, 128, 247, 0.35), rgba(126, 90, 255, 0.35));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.controls .btn:hover {
  background: linear-gradient(145deg, rgba(112, 128, 247, 0.6), rgba(126, 90, 255, 0.6));
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  transition: transform 120ms ease, background 160ms ease;
}

.controls .btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

.game-canvas {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-content {
  text-align: center;
  padding: 50px 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-over-content h2 {
  font-size: clamp(36px, 7vw, 52px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 25px;
  font-weight: 800;
}

.final-score {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 15px 0;
}

.final-moves {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 35px;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  z-index: 1200;
  padding: 16px;
}

.modal {
  width: min(90vw, 360px);
  background: linear-gradient(145deg, rgba(102, 126, 234, 0.18), rgba(118, 75, 162, 0.18));
  border-radius: 18px;
  padding: 22px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.modal input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 14px;
}

.modal input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.35);
}

.modal-error {
  color: #ff9b9b;
  font-size: 13px;
}

.modal-submit {
  width: 100%;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .game-app {
    padding: 10px;
    gap: 15px;
  }
  
  .header {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 10px 12px;
  }

  .hero-profile {
    flex: 1;
    min-width: 0;
    justify-content: flex-start;
    gap: 8px;
    padding: 6px 10px;
  }

  .hero-avatar {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .hero-label {
    font-size: 11px;
  }

  .hero-name {
    font-size: 16px;
    max-width: 140px;
  }

  .scores {
    gap: 6px;
  }

  .score-box {
    padding: 4px 8px;
    min-width: 64px;
    border-radius: 8px;
  }

  .score-value {
    font-size: 18px;
  }
  
  .controls .btn {
    min-width: 42px;
    max-width: 48px;
    padding: 8px;
    font-size: 18px;
  }
}
</style>
