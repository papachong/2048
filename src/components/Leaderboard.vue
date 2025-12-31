<template>
  <transition name="fade">
    <div class="leaderboard-overlay" @click.self="$emit('close')">
      <div class="leaderboard-content">
        <div class="leaderboard-header">
          <h2>🏆 排行榜</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
        
        <div v-if="leaderboard.length === 0" class="empty-state">
          <p>还没有成绩记录</p>
          <p class="hint">完成一局游戏后会自动记录</p>
        </div>
        
        <div v-else class="leaderboard-list">
          <div 
            v-for="(entry, index) in leaderboard" 
            :key="index"
            class="leaderboard-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank">
              <span v-if="index === 0" class="medal">🥇</span>
              <span v-else-if="index === 1" class="medal">🥈</span>
              <span v-else-if="index === 2" class="medal">🥉</span>
              <span v-else class="rank-number">{{ index + 1 }}</span>
            </div>
            
            <div class="entry-details">
              <div class="entry-score">{{ entry.score.toLocaleString() }}</div>
              <div class="entry-meta">
                <span class="entry-name">👤 {{ entry.name || '玩家' }}</span>
                <span>{{ entry.moves }} 移动</span>
                <span>{{ formatTime(entry.time) }}</span>
                <span>{{ formatDate(entry.date) }}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Leaderboard',
  props: {
    leaderboard: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close'],
  methods: {
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }
}
</script>

<style scoped>
.leaderboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.leaderboard-content {
  background: #faf8ef;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #bbada0;
}

.leaderboard-header h2 {
  margin: 0;
  color: #776e65;
  font-size: 28px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #776e65;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #bbada0;
  color: #f9f6f2;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #776e65;
}

.empty-state p {
  margin: 10px 0;
  font-size: 18px;
}

.hint {
  font-size: 14px;
  opacity: 0.7;
}

.leaderboard-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 8px;
  background: #ede0c8;
  border-radius: 8px;
  transition: all 0.2s;
}

.leaderboard-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #f2b179 0%, #f59563 100%);
}

.rank {
  min-width: 40px;
  text-align: center;
}

.medal {
  font-size: 28px;
}

.rank-number {
  font-size: 20px;
  font-weight: bold;
  color: #776e65;
}

.entry-details {
  flex: 1;
}

.entry-score {
  font-size: 24px;
  font-weight: bold;
  color: #776e65;
  margin-bottom: 5px;
}

.entry-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8f7a66;
  flex-wrap: wrap;
}

.entry-name {
  font-weight: 600;
  color: #5c4a3c;
}

/* 滚动条样式 */
.leaderboard-list::-webkit-scrollbar {
  width: 8px;
}

.leaderboard-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.leaderboard-list::-webkit-scrollbar-thumb {
  background: #bbada0;
  border-radius: 4px;
}

.leaderboard-list::-webkit-scrollbar-thumb:hover {
  background: #8f7a66;
}

/* 响应式 */
@media (max-width: 480px) {
  .leaderboard-header h2 {
    font-size: 24px;
  }
  
  .entry-score {
    font-size: 20px;
  }
  
  .medal {
    font-size: 24px;
  }
}
</style>
