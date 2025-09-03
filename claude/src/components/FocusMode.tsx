import { useState, useEffect } from 'react'
import { X, CheckCircle, MoreHorizontal, StopCircle } from 'lucide-react'
import { PomodoroTimer } from './PomodoroTimer'
import { SubtaskList } from './SubtaskList'
import type { Task, UserPrefs, SessionType } from '../types'

interface FocusModeProps {
  task: Task | null
  sessionType: SessionType
  userPrefs: UserPrefs
  onExitFocus: () => void
  onSessionComplete: (notes?: string, completeTask?: boolean, continueSession?: boolean, newSubtaskTitle?: string) => void
  onSessionStart?: () => void
  onTaskComplete?: (taskId: string) => void
  onAddSubtask?: (taskId: string, title: string) => void
  onUpdateSubtask?: (taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => void
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void
}

export function FocusMode({ 
  task, 
  sessionType,
  userPrefs,
  onExitFocus, 
  onSessionComplete,
  onSessionStart,
  onTaskComplete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask
}: FocusModeProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleTaskComplete = () => {
    if (task && onTaskComplete) {
      onTaskComplete(task.id)
    }
  }

  const handleCancelSession = () => {
    setShowCancelConfirm(false)
    onExitFocus()
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCancelConfirm) {
          setShowCancelConfirm(false)
        } else {
          setShowCancelConfirm(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showCancelConfirm])

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-gray-900 dark:text-gray-100 flex-1">
            <h1 className="text-2xl font-bold mb-3">Focus Mode</h1>
            {sessionType === 'focus' && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">Stay focused on your current task</p>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-4"
                  title="Cancel session and return to main page"
                >
                  <StopCircle className="w-3 h-3" />
                  Cancel Session
                </button>
              </div>
            )}
            {sessionType !== 'focus' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mt-2"
                title="Cancel session and return to main page"
              >
                <StopCircle className="w-3 h-3" />
                Cancel Session
              </button>
            )}
          </div>
          
          <button
            onClick={onExitFocus}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            title="Exit focus mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Task Info */}
        {sessionType === 'focus' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {task ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{task.title}</h2>
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
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{task.notes}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.estimate_pomos && (
                        <span>Estimated: {task.estimate_pomos} pomodoros</span>
                      )}
                      {task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subtasks */}
                    {onUpdateSubtask && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {task.subtasks.length > 0 ? 'Subtasks Progress' : 'Break this task down'}
                        </h3>
                        <SubtaskList
                          taskId={task.id}
                          subtasks={task.subtasks}
                          onAddSubtask={onAddSubtask || (() => {})}
                          onUpdateSubtask={onUpdateSubtask}
                          onDeleteSubtask={onDeleteSubtask || (() => {})}
                          readonly={false}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Focus Session</h2>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        General Work
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Focus on whatever needs your attention right now. Use this time for planning, organizing, or any task that comes to mind.
                    </p>
                  </>
                )}
              </div>

              {task && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleTaskComplete}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Mark task as complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </button>
                  
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Break Message */}
        {sessionType !== 'focus' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {sessionType === 'short_break' ? 'Short Break Time' : 'Long Break Time'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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
          <div className="mt-8 card">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Focus Tips</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Close unnecessary browser tabs and applications</li>
              <li>• Put your phone in another room or use Do Not Disturb</li>
              <li>• If distracted, jot down the thought and return to your task</li>
              <li>• Stay hydrated and maintain good posture</li>
            </ul>
          </div>
        )}

        {/* Break Tips */}
        {sessionType !== 'focus' && (
          <div className="mt-8 card">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Break Ideas</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
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

        {/* Cancel Session Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Cancel Session?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to cancel this session? Your progress will be saved, but the session will be marked as interrupted.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Continue Session
                </button>
                <button
                  onClick={handleCancelSession}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                >
                  Cancel Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}