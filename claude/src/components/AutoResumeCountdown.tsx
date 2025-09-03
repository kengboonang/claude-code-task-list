import { useState, useEffect } from 'react'
import { Play, X } from 'lucide-react'
import type { SessionType } from '../types'

interface AutoResumeCountdownProps {
  nextSessionType: SessionType
  countdown: number
  onAutoStart: () => void
  onCancel: () => void
  nextTaskTitle?: string
}

export function AutoResumeCountdown({
  nextSessionType,
  countdown,
  onAutoStart,
  onCancel,
  nextTaskTitle
}: AutoResumeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(countdown)

  useEffect(() => {
    if (timeLeft <= 0) {
      onAutoStart()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onAutoStart])

  const sessionTypeConfig = {
    focus: {
      title: 'Focus Session',
      color: 'focus',
      bgColor: 'bg-focus-50',
      textColor: 'text-focus-900',
      description: nextTaskTitle ? `Working on: ${nextTaskTitle}` : 'Ready to focus again'
    },
    short_break: {
      title: 'Short Break',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      description: 'Time for a quick break'
    },
    long_break: {
      title: 'Long Break',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      description: 'Time for a longer break'
    },
  }

  const config = sessionTypeConfig[nextSessionType]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className={`${config.bgColor} rounded-xl p-8 shadow-xl max-w-md w-full`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
            Starting {config.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {config.description}
          </p>

          {/* Countdown Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
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
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (countdown - timeLeft) / countdown)}`}
                className={`text-${config.color}-600 transition-all duration-1000 ease-linear`}
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${config.textColor}`}>
                  {timeLeft}
                </div>
                <div className="text-sm text-gray-500">
                  seconds
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={onAutoStart}
              className={`btn bg-${config.color}-600 hover:bg-${config.color}-700 text-white flex items-center gap-2`}
            >
              <Play className="w-4 h-4" />
              Start Now
            </button>
            
            <button
              onClick={onCancel}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            The session will start automatically in {timeLeft} seconds
          </p>
        </div>
      </div>
    </div>
  )
}