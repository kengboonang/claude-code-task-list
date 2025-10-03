import { Clock, Coffee, MessageSquare, Pause, Play } from 'lucide-react'
import type { Session, Task } from '../types'

interface SessionHistoryProps {
  sessions: Session[]
  tasks: Task[]
}

export function SessionHistory({ sessions, tasks }: SessionHistoryProps) {
  const sortedSessions = sessions.sort((a, b) => b.start_at.getTime() - a.start_at.getTime())

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return null
    const task = tasks.find(t => t.id === taskId)
    return task?.title || 'Unknown Task'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getSessionIcon = (type: Session['type']) => {
    switch (type) {
      case 'focus':
        return <Play className="w-4 h-4 text-focus-600" />
      case 'short_break':
        return <Coffee className="w-4 h-4 text-green-600" />
      case 'long_break':
        return <Pause className="w-4 h-4 text-blue-600" />
    }
  }

  const getSessionTypeLabel = (type: Session['type']) => {
    switch (type) {
      case 'focus':
        return 'Focus Session'
      case 'short_break':
        return 'Short Break'
      case 'long_break':
        return 'Long Break'
    }
  }

  if (sortedSessions.length === 0) {
    return <div className="text-gray-500">No sessions found for this date.</div>
  }

  return (
    <div className="space-y-3">
      {sortedSessions.map((session) => {
            const taskTitle = getTaskTitle(session.task_id)

            return (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSessionIcon(session.type)}
                    <span className="font-medium text-gray-900">
                      {getSessionTypeLabel(session.type)}
                    </span>
                    {taskTitle && (
                      <span className="text-sm text-gray-600">
                        • {taskTitle}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(session.start_at)} - {session.end_at && formatTime(session.end_at)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.duration} minutes
                  </span>
                </div>

                {session.notes && (
                  <div className="mt-3 p-3 bg-white rounded border-l-4 border-l-blue-200">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Session Notes:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{session.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!session.notes && session.type === 'focus' && (
                  <div className="mt-2 text-xs text-gray-400 italic">
                    No notes recorded for this session
                  </div>
                )}
              </div>
            )
          })}

      <div className="text-center pt-2">
        <p className="text-sm text-gray-500">
          Total focus time: {' '}
          <span className="font-medium">
            {Math.round(sortedSessions
              .filter(s => s.type === 'focus')
              .reduce((total, s) => total + s.duration, 0) * 10) / 10} minutes
          </span>
        </p>
      </div>
    </div>
  )
}
