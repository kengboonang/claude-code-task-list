import { useEffect, useState } from 'react'
import { Play, Pause, Square, Plus, RotateCcw } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import type { SessionType, UserPrefs } from '../types'

interface PomodoroTimerProps {
  sessionType: SessionType
  userPrefs: UserPrefs
  onSessionComplete: (notes?: string, completeTask?: boolean) => void
  onSessionStart?: () => void
  taskTitle?: string
}

export function PomodoroTimer({ 
  sessionType, 
  userPrefs, 
  onSessionComplete, 
  onSessionStart,
  taskTitle 
}: PomodoroTimerProps) {
  const [sessionNotes, setSessionNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [completeTaskWhenDone, setCompleteTaskWhenDone] = useState(false)

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

  const sessionTypeConfig = {
    focus: {
      title: 'Focus Time',
      color: 'focus',
      bgColor: 'bg-focus-50',
      textColor: 'text-focus-900',
      buttonColor: 'btn-focus',
    },
    short_break: {
      title: 'Short Break',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
    },
    long_break: {
      title: 'Long Break',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }

  const config = sessionTypeConfig[sessionType]

  useEffect(() => {
    timer.onComplete(() => {
      if (userPrefs.sound_enabled) {
        // Play completion sound (browser notification sound)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmAfBjqS2fPNeSsFJXfH8N2QQAoUXrTp66hVFApAA')
        audio.play().catch(() => {})
      }
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Session Complete!', {
          body: sessionType === 'focus' 
            ? 'Time for a break!' 
            : 'Ready to focus again?',
          icon: '/favicon.ico'
        })
      }
    })
  }, [timer, sessionType, userPrefs.sound_enabled])

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true)
      onSessionStart?.()
    }
    timer.start()
  }

  const handleComplete = () => {
    onSessionComplete(sessionNotes || undefined, completeTaskWhenDone)
    setSessionNotes('')
    setShowNotes(false)
    setHasStarted(false)
    setCompleteTaskWhenDone(false)
  }

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }


  return (
    <div className={`${config.bgColor} rounded-xl p-8 shadow-lg max-w-md mx-auto`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
          {config.title}
        </h2>
        
        {taskTitle && sessionType === 'focus' && (
          <p className="text-gray-600 mb-4 text-sm">
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
              className="text-gray-200"
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
              <div className="text-sm text-gray-500 mt-1">
                {timer.isRunning ? 'Running' : timer.isPaused ? 'Paused' : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
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
            <>
              <button
                onClick={timer.stop}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>

              <button
                onClick={() => timer.extend(1)}
                className="btn btn-secondary flex items-center gap-2"
                title="Add 1 minute"
              >
                <Plus className="w-4 h-4" />
                1m
              </button>
            </>
          )}

          <button
            onClick={() => timer.reset()}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Session Notes */}
        {hasStarted && (
          <div className="text-left">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-gray-600 hover:text-gray-800 mb-2"
            >
              {showNotes ? 'Hide' : 'Add'} session notes
            </button>
            
            {showNotes && (
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did this session go? Any insights or blockers?"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>
        )}

        {/* Task Completion Option */}
        {(timer.isCompleted || hasStarted) && sessionType === 'focus' && taskTitle && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={completeTaskWhenDone}
                onChange={(e) => setCompleteTaskWhenDone(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">
                Mark "{taskTitle}" as completed when I finish this session
              </span>
            </label>
          </div>
        )}

        {/* Complete Session Button */}
        {(timer.isCompleted || hasStarted) && (
          <button
            onClick={handleComplete}
            className="w-full btn-primary mt-4"
          >
            Complete Session
          </button>
        )}
      </div>
    </div>
  )
}