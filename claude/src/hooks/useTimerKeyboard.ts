import { useEffect, useRef } from 'react'

interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  extend: (minutes: number) => void
  reduce: (minutes: number) => void
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
      const handled = ['Space', 'Enter', 'KeyR', 'Equal', 'Minus']
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

        case 'KeyR':
          // 'R': Reset timer
          timerControls.reset()
          break

        case 'Equal':
          // '+': Extend timer by 1 minute
          timerControls.extend(1)
          break

        case 'Minus':
          // '-': Reduce timer by 1 minute
          timerControls.reduce(1)
          break

        case 'Enter':
          // Enter: Set custom time
          if (onComplete) {
            onComplete()
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
    { key: 'R', description: 'Reset timer' },
    { key: '+', description: 'Extend timer (+1 min)' },
    { key: '-', description: 'Reduce timer (-1 min)' },
    { key: 'Enter', description: 'Set custom time' },
  ]

  return { shortcuts, shortcutsRef }
}
