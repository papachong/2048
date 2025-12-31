// 音效管理器
import { Howl } from 'howler'

export class SoundManager {
  constructor() {
    this.enabled = this.loadSoundPreference()
    this.sounds = {}
    this.ctx = this.createContext()
    this.unlocked = false
    this.initSounds()
  }

  createContext() {
    if (typeof window === 'undefined') return null
    const Ctx = window.AudioContext || window.webkitAudioContext
    return Ctx ? new Ctx() : null
  }

  unlock() {
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    this.unlocked = true
  }

  initSounds() {
    // 使用简单的音频数据URL或者可以替换为实际音频文件
    // 这里使用 Web Audio API 生成简单音效
    this.sounds = {
      move: this.createBeep(200, 0.1, 'sine'),
      merge: this.createBeep(400, 0.15, 'triangle'),
      spawn: this.createBeep(300, 0.08, 'sine'),
      gameOver: this.createBeep(150, 0.3, 'sawtooth'),
      win: this.createMelody([523, 659, 784, 1047], 0.15)
    }
  }

  createBeep(frequency, duration, type = 'sine') {
    // 生成简单的音效
    return {
      play: () => {
        if (!this.enabled || !this.ctx) return
        if (!this.unlocked && this.ctx.state === 'suspended') return

        const oscillator = this.ctx.createOscillator()
        const gainNode = this.ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.ctx.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = type
        
        const now = this.ctx.currentTime
        gainNode.gain.setValueAtTime(0.3, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)
        
        oscillator.start(now)
        oscillator.stop(now + duration)
      }
    }
  }

  createMelody(frequencies, noteDuration) {
    return {
      play: () => {
        if (!this.enabled || !this.ctx) return
        if (!this.unlocked && this.ctx.state === 'suspended') return
        
        frequencies.forEach((freq, index) => {
          const oscillator = this.ctx.createOscillator()
          const gainNode = this.ctx.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(this.ctx.destination)
          
          oscillator.frequency.value = freq
          oscillator.type = 'sine'
          
          const startTime = this.ctx.currentTime + (index * noteDuration)
          gainNode.gain.setValueAtTime(0.2, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration)
          
          oscillator.start(startTime)
          oscillator.stop(startTime + noteDuration)
        })
      }
    }
  }

  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      this.unlock()
      this.sounds[soundName].play()
    }
  }

  toggle() {
    this.enabled = !this.enabled
    this.saveSoundPreference()
    return this.enabled
  }

  setEnabled(enabled) {
    this.enabled = enabled
    this.saveSoundPreference()
  }

  saveSoundPreference() {
    localStorage.setItem('2048-sound-enabled', this.enabled ? '1' : '0')
  }

  loadSoundPreference() {
    const saved = localStorage.getItem('2048-sound-enabled')
    return saved === null ? true : saved === '1'
  }
}
