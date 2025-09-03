import { useEffect, useRef } from 'react'

interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  extend: (minutes: number) => void
  snooze: (seconds: number) => void
  isRunning: boolean
  isPaused: boolean
}

interface UseTimerKeyboardOptions {
  timerControls: TimerControls | null
  onComplete?: () => void
  onCancel?: () => void
  enabled?: boolean
}

export function useTimerKeyboard({ 
  timerControls, 
  onComplete, 
  onCancel, 
  enabled = true 
}: UseTimerKeyboardOptions) {
  const shortcutsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !timerControls) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Prevent default for our handled keys
      const handled = ['Space', 'Enter', 'KeyR', 'KeyS', 'KeyP', 'Escape', 'Equal', 'Minus']
      if (handled.includes(event.code)) {
        event.preventDefault()
      }

      switch (event.code) {
        case 'Space':
          // Space: Start/Pause/Resume
          if (!timerControls.isRunning && !timerControls.isPaused) {
            timerControls.start()
          } else if (timerControls.isRunning) {
            timerControls.pause()
          } else if (timerControls.isPaused) {
            timerControls.resume()
          }
          break

        case 'KeyS':
          // 'S': Stop timer
          if (timerControls.isRunning || timerControls.isPaused) {
            timerControls.stop()
          }
          break

        case 'KeyR':
          // 'R': Reset timer
          timerControls.reset()
          break

        case 'Equal':
          // '+': Extend timer by 1 minute
          if (timerControls.isRunning || timerControls.isPaused) {
            timerControls.extend(1)
          }
          break

        case 'Minus':
          // '-': Snooze timer by 60 seconds
          if (timerControls.isRunning || timerControls.isPaused) {
            timerControls.snooze(60)
          }
          break

        case 'Enter':
          // Enter: Complete session
          if (onComplete) {
            onComplete()
          }
          break

        case 'Escape':
          // Escape: Cancel/Exit
          if (onCancel) {
            onCancel()
          }
          break

        default:
          return // Don't prevent default for unhandled keys
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [timerControls, onComplete, onCancel, enabled])

  const shortcuts = [
    { key: 'Space', description: 'Start/Pause/Resume timer' },
    { key: 'S', description: 'Stop timer' },
    { key: 'R', description: 'Reset timer' },
    { key: '+', description: 'Extend timer (+1 min)' },
    { key: '-', description: 'Snooze timer (+1 min)' },
    { key: 'Enter', description: 'Complete session' },
    { key: 'Esc', description: 'Cancel session' },
  ]

  return { shortcuts, shortcutsRef }
}