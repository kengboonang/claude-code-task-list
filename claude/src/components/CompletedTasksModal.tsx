import { AlertCircle, CheckCircle, Clock, Trash2, Undo2, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import type { Session, Task } from '../types'

interface CompletedTasksModalProps {
  tasks: Task[]
  sessions: Session[]
  onMarkIncomplete: (taskId: string) => void
  onDeleteForever: (taskId: string) => void
  onClose: () => void
}

export default function CompletedTasksModal({
  tasks,
  sessions,
  onMarkIncomplete,
  onDeleteForever,
  onClose,
}: CompletedTasksModalProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  }, [tasks])

  const formatDateTime = (date: Date) => {
    try {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return ''
    }
  }

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  // Sum focus time spent on this task up to the completion moment (updated_at)
  const getTimeSpentForTask = (task: Task) => {
    const completedAt = task.updated_at
    const relevant = sessions.filter(s =>
      s.completed &&
      s.type === 'focus' &&
      s.task_id === task.id &&
      // if end_at missing but completed is true, accept it; otherwise use end_at to compare
      (
        (s.end_at ? s.end_at.getTime() <= completedAt.getTime() : true)
      )
    )
    // duration stored is in minutes already
    const total = relevant.reduce((acc, s) => acc + (s.duration || 0), 0)
    // round to 1 decimal then to integer minutes for display granularity
    return Math.round(total * 10) / 10
  }

  const closeOnEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    document.addEventListener('keydown', closeOnEsc)
    return () => document.removeEventListener('keydown', closeOnEsc)
  }, [])

  const closeBtnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Completed Tasks</h2>
            </div>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No completed tasks</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tasks you complete will appear here with completion time and total focus time invested.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map(task => {
                const timeSpent = getTimeSpentForTask(task)
                return (
                  <div
                    key={task.id}
                    className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-900 dark:text-green-100 line-through">
                            {task.title}
                          </span>
                          {task.is_mit && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-200 text-xs font-medium rounded-full">
                              MIT
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            task.priority === 'P1' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                            task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-green-800 dark:text-green-200 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Completed at: {formatDateTime(task.updated_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Time taken: {formatMinutes(timeSpent)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onMarkIncomplete(task.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Mark as incomplete"
                        >
                          <Undo2 className="w-4 h-4" />
                          Mark Incomplete
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this task forever? This cannot be undone.')) {
                              onDeleteForever(task.id)
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete forever"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
