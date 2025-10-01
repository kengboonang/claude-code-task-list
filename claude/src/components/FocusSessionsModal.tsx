import { Clock, X } from 'lucide-react'
import { Session, Task } from '../types'

interface FocusSessionsModalProps {
  sessions: Session[]
  tasks: Task[]
  onClose: () => void
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function FocusSessionsModal({ sessions, tasks, onClose }: FocusSessionsModalProps) {
  const todayFocusSessions = sessions.filter(s =>
    s.type === 'focus' &&
    s.completed &&
    new Date(s.start_at).toDateString() === new Date().toDateString()
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Focus Sessions</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {todayFocusSessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No focus sessions today</h3>
              <p className="text-gray-500 dark:text-gray-400">
                You haven't completed any focus sessions today yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayFocusSessions.map(session => {
                const task = tasks.find(t => t.id === session.task_id)
                return (
                  <div key={session.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          {task?.title || 'Quick Focus Session'}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">
                          {new Date(session.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {session.end_at && (
                            <> - {new Date(session.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </div>
                        {session.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{session.notes}"</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-900 dark:text-blue-100">
                          {formatDuration(session.duration)}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300">
                          of {formatDuration(session.planned_duration)} planned
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
