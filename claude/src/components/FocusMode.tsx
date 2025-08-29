import { X, CheckCircle, MoreHorizontal } from 'lucide-react'
import { PomodoroTimer } from './PomodoroTimer'
import type { Task, UserPrefs, SessionType } from '../types'

interface FocusModeProps {
  task: Task | null
  sessionType: SessionType
  userPrefs: UserPrefs
  onExitFocus: () => void
  onSessionComplete: (notes?: string) => void
  onSessionStart?: () => void
  onTaskComplete?: (taskId: string) => void
}

export function FocusMode({ 
  task, 
  sessionType,
  userPrefs,
  onExitFocus, 
  onSessionComplete,
  onSessionStart,
  onTaskComplete
}: FocusModeProps) {
  const handleTaskComplete = () => {
    if (task && onTaskComplete) {
      onTaskComplete(task.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Focus Mode</h1>
            {sessionType === 'focus' && (
              <p className="text-gray-300 mt-1">Stay focused on your current task</p>
            )}
          </div>
          
          <button
            onClick={onExitFocus}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Exit focus mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Task Info */}
        {task && sessionType === 'focus' && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                  {task.is_mit && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      MIT
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                    task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.notes && (
                  <p className="text-gray-600 mb-3">{task.notes}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {task.estimate_pomos && (
                    <span>Estimated: {task.estimate_pomos} pomodoros</span>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleTaskComplete}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Mark task as complete"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Break Message */}
        {sessionType !== 'focus' && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {sessionType === 'short_break' ? 'Short Break Time' : 'Long Break Time'}
            </h2>
            <p className="text-gray-600">
              {sessionType === 'short_break' 
                ? 'Take a few minutes to rest and recharge. Stay nearby for the next focus session.'
                : 'Time for a longer break! Step away from your workspace and do something refreshing.'
              }
            </p>
          </div>
        )}

        {/* Timer */}
        <PomodoroTimer
          sessionType={sessionType}
          userPrefs={userPrefs}
          onSessionComplete={onSessionComplete}
          onSessionStart={onSessionStart}
          taskTitle={task?.title}
        />

        {/* Focus Tips */}
        {sessionType === 'focus' && (
          <div className="mt-8 bg-gray-800 rounded-lg p-4 text-gray-300">
            <h3 className="font-medium text-white mb-2">Focus Tips</h3>
            <ul className="text-sm space-y-1">
              <li>• Close unnecessary browser tabs and applications</li>
              <li>• Put your phone in another room or use Do Not Disturb</li>
              <li>• If distracted, jot down the thought and return to your task</li>
              <li>• Stay hydrated and maintain good posture</li>
            </ul>
          </div>
        )}

        {/* Break Tips */}
        {sessionType !== 'focus' && (
          <div className="mt-8 bg-gray-800 rounded-lg p-4 text-gray-300">
            <h3 className="font-medium text-white mb-2">Break Ideas</h3>
            <ul className="text-sm space-y-1">
              {sessionType === 'short_break' ? (
                <>
                  <li>• Stand up and stretch</li>
                  <li>• Look out the window or at something far away</li>
                  <li>• Do some deep breathing exercises</li>
                  <li>• Grab a glass of water</li>
                </>
              ) : (
                <>
                  <li>• Take a walk outside</li>
                  <li>• Have a healthy snack</li>
                  <li>• Do some light exercise or yoga</li>
                  <li>• Chat with a friend or colleague</li>
                  <li>• Listen to music or a podcast</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}