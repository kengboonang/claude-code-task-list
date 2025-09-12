import { useEffect, useState, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'
import { Play, Pause, Square, Plus, RotateCcw, Clock, Keyboard } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useTimerKeyboard } from '../hooks/useTimerKeyboard'
import type { SessionType, UserPrefs } from '../types'

interface PomodoroTimerProps {
  sessionType: SessionType
  userPrefs: UserPrefs
  onSessionComplete: (notes?: string, completeTask?: boolean, continueSession?: boolean, newSubtaskTitle?: string) => void
  onSessionStart?: () => void
  taskTitle?: string
}

interface PomodoroTimerRef {
  getTimerControls: () => {
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
}

export const PomodoroTimer = forwardRef<PomodoroTimerRef, PomodoroTimerProps>(({ 
  sessionType, 
  userPrefs, 
  onSessionComplete, 
  onSessionStart,
  taskTitle 
}, ref) => {
  const [sessionNotes, setSessionNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [completeTaskWhenDone, setCompleteTaskWhenDone] = useState(false)
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [showCompletionOptions, setShowCompletionOptions] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  const getSessionLength = () => {
    switch (sessionType) {
      case 'focus':
        return userPrefs.pomo_length
      case 'short_break':
        return userPrefs.short_break_length
      case 'long_break':
        return userPrefs.long_break_length
      default:
        return 25
    }
  }

  const timer = useTimer(getSessionLength())

  const handleStart = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true)
      onSessionStart?.()
    }
    timer.start()
  }, [hasStarted, onSessionStart, timer])

  // Timer controls for keyboard shortcuts
  const timerControls = useMemo(() => ({
    start: handleStart,
    pause: timer.pause,
    resume: timer.resume,
    stop: timer.stop,
    reset: () => timer.reset(),
    extend: timer.extend,
    snooze: timer.snooze,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
  }), [handleStart, timer])

  // Keyboard shortcuts
  const { shortcuts } = useTimerKeyboard({
    timerControls,
    onComplete: () => {
      if (timer.isCompleted || hasStarted || timer.isRunning || timer.isPaused) {
        if (!showCompletionOptions) {
          setShowCompletionOptions(true)
        } else {
          handleComplete()
        }
      }
    },
    onCancel: () => {
      // Close any open menus first, then handle exit
      if (showCompletionOptions) {
        setShowCompletionOptions(false)
      } else if (showSnoozeOptions) {
        setShowSnoozeOptions(false)
      } else if (showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false)
      }
    },
    enabled: true
  })

  // Expose timer controls via ref
  useImperativeHandle(ref, () => ({
    getTimerControls: () => timerControls
  }), [timerControls])

  const sessionTypeConfig = {
    focus: {
      title: 'Focus Time',
      color: 'focus',
      bgColor: 'bg-focus-50 dark:bg-focus-900/20',
      textColor: 'text-focus-900 dark:text-focus-100',
      buttonColor: 'btn-focus',
    },
    short_break: {
      title: 'Short Break',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-900 dark:text-green-100',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
    },
    long_break: {
      title: 'Long Break',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-900 dark:text-blue-100',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }

  const config = sessionTypeConfig[sessionType]

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const playCompletionSound = useCallback(() => {
    if (!userPrefs.sound_enabled) return

    // Try to play a more pleasant completion sound
    try {
      // Create a pleasant ding sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create oscillator for a pleasant ding
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Set frequency for a pleasant bell-like sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
      
      oscillator.type = 'sine'
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
      
      // Cleanup
      setTimeout(() => {
        try {
          audioContext.close()
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 1000)
    } catch (error) {
      // Fallback to simple beep if Web Audio API fails
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApAA')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (fallbackError) {
        // If all sound methods fail, silently ignore
      }
    }
  }, [userPrefs.sound_enabled])

  const showCompletionNotification = useCallback(() => {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = sessionType === 'focus' ? '🎉 Focus Session Complete!' : '✨ Break Time Over!'
      const body = sessionType === 'focus' 
        ? `Great work! ${taskTitle ? `You worked on "${taskTitle}". ` : ''}Time for a well-deserved break!`
        : 'Ready to focus again? Your next session awaits!'
      
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-session',
        requireInteraction: false,
        silent: false
      })

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }, [sessionType, taskTitle])

  useEffect(() => {
    timer.onComplete(() => {
      playCompletionSound()
      showCompletionNotification()
    })
  }, [timer, playCompletionSound, showCompletionNotification])

  const handleComplete = () => {
    onSessionComplete(sessionNotes || undefined, completeTaskWhenDone)
    resetState()
  }

  const handleContinueSession = () => {
    onSessionComplete(sessionNotes || undefined, false, true)
    resetState()
  }

  const handleAddSubtaskAndComplete = () => {
    if (newSubtaskTitle.trim()) {
      onSessionComplete(sessionNotes || undefined, false, false, newSubtaskTitle.trim())
    }
    resetState()
  }

  const resetState = () => {
    setSessionNotes('')
    setShowNotes(false)
    setHasStarted(false)
    setCompleteTaskWhenDone(false)
    setShowCompletionOptions(false)
    setNewSubtaskTitle('')
    setShowKeyboardShortcuts(false)
    setShowSnoozeOptions(false)
  }

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }


  return (
    <div className={`${config.bgColor} rounded-xl p-8 shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
          {config.title}
        </h2>
        
        {taskTitle && sessionType === 'focus' && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Working on: <span className="font-medium">{taskTitle}</span>
          </p>
        )}

        {/* Progress Ring */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - timer.progress)}`}
              className={`text-${config.color}-600 transition-all duration-1000 ease-linear`}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${config.textColor}`}>
                {formatTime(timer.minutes, timer.seconds)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {timer.isRunning ? 'Running' : timer.isPaused ? 'Paused' : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 mb-4">
          {/* Primary Controls */}
          <div className="flex justify-center gap-3">
            {!timer.isRunning && !timer.isPaused && (
              <button
                onClick={handleStart}
                className={`btn ${config.buttonColor} flex items-center gap-2`}
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}

            {timer.isRunning && (
              <button
                onClick={timer.pause}
                className={`btn ${config.buttonColor} flex items-center gap-2`}
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}

            {timer.isPaused && (
              <button
                onClick={timer.resume}
                className={`btn ${config.buttonColor} flex items-center gap-2`}
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}

            {(timer.isRunning || timer.isPaused) && (
              <button
                onClick={timer.stop}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            )}

            <button
              onClick={() => timer.reset()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Secondary Controls */}
          {(timer.isRunning || timer.isPaused) && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => timer.extend(1)}
                className="btn btn-secondary text-sm flex items-center gap-1"
                title="Add 1 minute"
              >
                <Plus className="w-3 h-3" />
                1m
              </button>

              <button
                onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                className="btn btn-secondary text-sm flex items-center gap-1"
                title="Snooze for 30-120 seconds"
              >
                <Clock className="w-3 h-3" />
                Snooze
              </button>

              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="btn btn-outline text-sm flex items-center gap-1"
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Keyboard shortcut button when timer is not active */}
          {!timer.isRunning && !timer.isPaused && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="btn btn-outline text-sm flex items-center gap-1"
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-3 h-3" />
                Shortcuts
              </button>
            </div>
          )}
        </div>

        {/* Snooze Options */}
        {showSnoozeOptions && (timer.isRunning || timer.isPaused) && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick snooze to finish your thought</h4>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  timer.snooze(30)
                  setShowSnoozeOptions(false)
                }}
                className="btn btn-secondary text-sm px-3 py-1"
              >
                +30s
              </button>
              <button
                onClick={() => {
                  timer.snooze(60)
                  setShowSnoozeOptions(false)
                }}
                className="btn btn-secondary text-sm px-3 py-1"
              >
                +1m
              </button>
              <button
                onClick={() => {
                  timer.snooze(90)
                  setShowSnoozeOptions(false)
                }}
                className="btn btn-secondary text-sm px-3 py-1"
              >
                +1.5m
              </button>
              <button
                onClick={() => {
                  timer.snooze(120)
                  setShowSnoozeOptions(false)
                }}
                className="btn btn-secondary text-sm px-3 py-1"
              >
                +2m
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Use sparingly to maintain your focus rhythm
            </p>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        {showKeyboardShortcuts && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {shortcuts.map(shortcut => (
                <div key={shortcut.key} className="flex items-center justify-between py-1">
                  <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono dark:text-gray-300">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              These shortcuts work when the timer is focused (not when typing in text fields)
            </p>
          </div>
        )}

        {/* Session Notes */}
        {hasStarted && (
          <div className="text-left">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2"
            >
              {showNotes ? 'Hide' : 'Add'} session notes
            </button>
            
            {showNotes && (
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did this session go? Any insights or blockers?"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>
        )}

        {/* Task Completion Option */}
        {(timer.isCompleted || hasStarted || timer.isRunning || timer.isPaused) && sessionType === 'focus' && taskTitle && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={completeTaskWhenDone}
                onChange={(e) => setCompleteTaskWhenDone(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Mark "{taskTitle}" as completed when I finish this session
              </span>
            </label>
          </div>
        )}

        {/* Session Completion Options */}
        {(timer.isCompleted || hasStarted || timer.isRunning || timer.isPaused) && (
          <div className="mt-4">
            {!showCompletionOptions ? (
              <button
                onClick={() => setShowCompletionOptions(true)}
                className="w-full btn-primary"
              >
                Complete Session
              </button>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How do you want to finish?</h4>
                
                {/* Quick Complete */}
                <button
                  onClick={handleComplete}
                  className="w-full btn-primary text-sm py-2"
                >
                  ✓ Complete Session
                </button>

                {/* Continue Session (for focus sessions) */}
                {sessionType === 'focus' && (
                  <button
                    onClick={handleContinueSession}
                    className="w-full btn btn-secondary text-sm py-2"
                  >
                    🔄 Continue with Another Pomodoro
                  </button>
                )}

                {/* Add Subtask (if there's a task) */}
                {sessionType === 'focus' && taskTitle && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Break this down into a subtask..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                          handleAddSubtaskAndComplete()
                        }
                      }}
                    />
                    <button
                      onClick={handleAddSubtaskAndComplete}
                      disabled={!newSubtaskTitle.trim()}
                      className="w-full btn btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ➕ Add Subtask & Complete
                    </button>
                  </div>
                )}

                {/* Cancel */}
                <button
                  onClick={() => setShowCompletionOptions(false)}
                  className="w-full btn btn-outline text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})