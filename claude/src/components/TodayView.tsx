import { BarChart3, Calendar, Clock, Eye, EyeOff, RotateCcw, Star, Trash2, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Session, Task } from '../types'
import CompletedTasksModal from './CompletedTasksModal'
import { DailyReview } from './DailyReview'
import { SessionHistory } from './SessionHistory'
import { TaskList } from './TaskList'
import { ThemeToggle } from './ThemeToggle'

interface TodayViewProps {
  todayTasks: Task[]
  activeTodayTasks: Task[]
  allTasks: Task[]
  mit: Task | undefined
  completedMIT: Task | undefined
  sessions: Session[]
  onCreateTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onSetMIT: (taskId: string) => void
  onStartFocus: (taskId: string) => void
  onStartQuickFocus: () => void
  onAddSubtask: (taskId: string, title: string) => void
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onResetAllData: () => void
  onResetDailyData: () => void
}

export function TodayView({
  todayTasks,
  activeTodayTasks,
  allTasks,
  mit,
  completedMIT,
  sessions,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onSetMIT,
  onStartFocus,
  onStartQuickFocus,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onResetAllData,
  onResetDailyData,
}: TodayViewProps) {
  const [showMITPrompt, setShowMITPrompt] = useState(!mit && activeTodayTasks.length > 0)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)
  const [showResetMenu, setShowResetMenu] = useState(false)
  const [showDailyReview, setShowDailyReview] = useState(false)
  const [showCompletedModal, setShowCompletedModal] = useState(false)
  const resetMenuRef = useRef<HTMLDivElement>(null)

  const todaysSessions = sessions.filter(session => {
    const today = new Date().toDateString()
    return session.start_at.toDateString() === today && session.completed
  })

  const focusSessions = todaysSessions.filter(session => session.type === 'focus')
  const totalFocusMinutes = Math.round(focusSessions.reduce((total, session) => total + session.duration, 0) * 10) / 10

  const completedTasks = todayTasks.filter(task => task.status === 'completed')

  const handleSetMIT = (taskId: string) => {
    onSetMIT(taskId)
    setShowMITPrompt(false)
  }

  // Close reset menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resetMenuRef.current && !resetMenuRef.current.contains(event.target as Node)) {
        setShowResetMenu(false)
      }
    }

    if (showResetMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResetMenu])

  const tasksToShow = showCompletedTasks
    ? todayTasks
    : activeTodayTasks

  const handleResetDaily = () => {
    if (confirm('This will reset your daily progress (completed tasks become todo, MIT selection cleared). This cannot be undone. Continue?')) {
      onResetDailyData()
      setShowResetMenu(false)
    }
  }

  const handleResetAll = () => {
    if (confirm('This will delete ALL tasks, sessions, and progress. This cannot be undone. Are you sure?')) {
      onResetAllData()
      setShowResetMenu(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Today</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Header Actions */}
        <div className="absolute top-0 right-0 flex gap-2">
          <ThemeToggle />

          <button
            onClick={() => setShowDailyReview(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Daily Review"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          <div className="relative" ref={resetMenuRef}>
            <button
              onClick={() => setShowResetMenu(!showResetMenu)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Reset options"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {showResetMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="p-2">
                  <button
                    onClick={handleResetDaily}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Daily Progress
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-focus-100 rounded-lg mx-auto mb-2">
            <Clock className="w-6 h-6 text-focus-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFocusMinutes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Focus Minutes</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{focusSessions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
        </div>

        <div
          className="card text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowCompletedModal(true)}
          title="View completed tasks"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mit ? '1' : '0'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">MIT Set</div>
        </div>
      </div>

      {/* Quick Focus Button */}
      <div className="card bg-focus-50 dark:bg-focus-900/20 border-focus-200 dark:border-focus-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-focus-900 dark:text-focus-100 mb-1">Need to focus right now?</h3>
            <p className="text-focus-700 dark:text-focus-300 text-sm">
              Start a pomodoro session without selecting a specific task. Perfect for general work or planning.
            </p>
          </div>
          <button
            onClick={onStartQuickFocus}
            className="btn-focus flex items-center gap-2 ml-4 whitespace-nowrap"
          >
            <Clock className="w-4 h-4" />
            Quick Focus
          </button>
        </div>
      </div>

      {/* MIT Selection Prompt */}
      {showMITPrompt && activeTodayTasks.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                What's your Most Important Task (MIT) for today?
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
                Choose one task that, if completed, would make your day feel successful.
              </p>
              <div className="space-y-2">
                {activeTodayTasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleSetMIT(task.id)}
                    className="block w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{task.title}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                        task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMITPrompt(false)}
                className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MIT Display */}
      {mit && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-600 fill-current" />
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Most Important Task</h3>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{mit.title}</h4>
                {mit.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mit.notes}</p>
                )}
              </div>
              <button
                onClick={() => onStartFocus(mit.id)}
                className="btn-focus flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed MIT Display */}
      {!mit && completedMIT && (
        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-green-600 fill-current" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">MIT Completed! 🎉</h3>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-through">{completedMIT.title}</h4>
                {completedMIT.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{completedMIT.notes}</p>
                )}
                <p className="text-sm text-green-600 mt-2">
                  Great job! Your most important task for today is complete.
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Tasks</h2>

          {completedTasks.length > 0 && (
            <button
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showCompletedTasks ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Completed ({completedTasks.length})
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Completed ({completedTasks.length})
                </>
              )}
            </button>
          )}
        </div>

        <TaskList
          tasks={tasksToShow}
          onCreateTask={onCreateTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onSetMIT={onSetMIT}
          onStartFocus={onStartFocus}
          onAddSubtask={onAddSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
          title=""
          showQuickAdd={true}
          showFocusButtons={!showCompletedTasks}
        />
      </div>

      {/* Empty State */}
      {tasksToShow.length === 0 && !showCompletedTasks && (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks for today</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first task above to get started with focused work.
          </p>
        </div>
      )}

      {/* Session History */}
      <SessionHistory sessions={sessions} tasks={allTasks} />

      {/* Completed Tasks Modal */}
      {showCompletedModal && (
        <CompletedTasksModal
          tasks={completedTasks}
          sessions={sessions}
          onMarkIncomplete={(id) => onUpdateTask(id, { status: 'todo' })}
          onDeleteForever={(id) => onDeleteTask(id)}
          onClose={() => setShowCompletedModal(false)}
        />
      )}

      {/* Daily Review Modal */}
      {showDailyReview && (
        <DailyReview
          tasks={allTasks}
          sessions={sessions}
          onClose={() => setShowDailyReview(false)}
        />
      )}
    </div>
  )
}
