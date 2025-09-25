import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Session, Task } from '../types'
import Calendar from './Calendar'
import CompletedTasksModal from './CompletedTasksModal'

/**
 * Format a Date into YYYY-MM-DD in local time (not UTC)
 */
function toLocalDateKey(d: Date) {
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().split('T')[0]
}

function formatHumanDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, (m - 1), d)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

interface DailyReviewPanelProps {
  tasks: Task[]
  sessions: Session[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  className?: string
}

/**
 * Sidebar version of DailyReview (non-modal) with a calendar on top.
 * Clicking on calendar dates switches the selected day and updates the summary.
 */
export default function DailyReviewPanel({ tasks, sessions, onUpdateTask, onDeleteTask, className }: DailyReviewPanelProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>(toLocalDateKey(new Date()))
const [showCompletedModal, setShowCompletedModal] = useState(false)

  const daily = useMemo(() => {
    const date = selectedDateKey

    const daySessions = sessions.filter(s =>
      s.completed && toLocalDateKey(s.start_at) === date
    )

    const focusSessions = daySessions.filter(s => s.type === 'focus')
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0)

    const completedOnDate = tasks.filter(t =>
      t.status === 'completed' &&
      toLocalDateKey(t.updated_at) === date
    )

    const plannedMinutes = focusSessions.reduce((acc, s) => acc + s.planned_duration, 0)
    const focusScore = plannedMinutes > 0 ? Math.round((totalFocusMinutes / plannedMinutes) * 100) : 0

    return {
      focusSessions,
      totalFocusMinutes: Math.round(totalFocusMinutes * 10) / 10,
      sessionsCount: focusSessions.length,
      completedTasks: completedOnDate,
      focusScore,
    }
  }, [sessions, tasks, selectedDateKey])

  const isToday = selectedDateKey === toLocalDateKey(new Date())
  const completedMIT = daily.completedTasks.find(t => t.is_mit)

  return (
    <div className={`flex flex-col h-full min-h-0 ${className || ''}`}>
      {/* Calendar block (non-scrollable) */}
      <div className="mb-4">
        <Calendar
          selectedDateKey={selectedDateKey}
          onSelect={setSelectedDateKey}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Selected day header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Daily Review</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{formatHumanDate(selectedDateKey)}{isToday ? ' • Today' : ''}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300 mx-auto mb-1" />
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {formatDuration(daily.totalFocusMinutes)}
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300">Focus</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
          <Target className="w-5 h-5 text-green-600 dark:text-green-300 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {daily.sessionsCount}
          </div>
          <div className="text-[11px] text-green-700 dark:text-green-300">Sessions</div>
        </div>
        <div
          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowCompletedModal(true)}
          title="View completed tasks"
        >
          <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-300 mx-auto mb-1" />
          <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {daily.completedTasks.length}
          </div>
          <div className="text-[11px] text-purple-700 dark:text-purple-300">Tasks Done</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800">
          <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-300 mx-auto mb-1" />
          <div className={`text-lg font-bold ${getScoreColor(daily.focusScore)}`}>
            {daily.focusScore}%
          </div>
          <div className="text-[11px] text-yellow-700 dark:text-yellow-300">Focus Score</div>
        </div>
      </div>

      {/* MIT achievement */}
      {completedMIT && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-yellow-900 dark:text-yellow-100">MIT Completed 🎉</div>
              <div className="text-yellow-800 dark:text-yellow-200">
                {completedMIT.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus sessions (compact) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Focus Sessions ({daily.focusSessions.length})
        </div>
        {daily.focusSessions.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">No focus sessions.</div>
        ) : (
          <div className="space-y-2">
            {daily.focusSessions.slice(0, 5).map(session => (
              <div key={session.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-blue-900 dark:text-blue-100">
                  {session.start_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.end_at?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-blue-700 dark:text-blue-300 font-medium">
                  {formatDuration(session.duration)}
                </div>
              </div>
            ))}
            {daily.focusSessions.length > 5 && (
              <div className="text-[11px] text-blue-700 dark:text-blue-300">+ {daily.focusSessions.length - 5} more</div>
            )}
          </div>
        )}
      </div>

      {/* Completed tasks (compact) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Tasks Completed ({daily.completedTasks.length})
        </div>
        {daily.completedTasks.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">No tasks completed.</div>
        ) : (
          <div className="space-y-1">
            {daily.completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-300 flex-shrink-0" />
                <div className="flex-1 truncate text-green-900 dark:text-green-100">
                  {task.title}
                </div>
                <span className={`px-1 py-0.5 text-[10px] font-medium rounded ${
                  task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                  task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {daily.completedTasks.length > 5 && (
              <div className="text-[11px] text-green-700 dark:text-green-300">+ {daily.completedTasks.length - 5} more</div>
            )}
          </div>
        )}
      </div>
      </div>
    {showCompletedModal && (
      <CompletedTasksModal
        tasks={daily.completedTasks}
        sessions={sessions}
        onMarkIncomplete={(id) => onUpdateTask(id, { status: 'todo' })}
        onDeleteForever={(id) => onDeleteTask(id)}
        onClose={() => setShowCompletedModal(false)}
      />
    )}
    </div>
  )
}
