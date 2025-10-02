import { X } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { formatDuration } from '../utils/timeUtils'

interface TodaySessionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TodaySessionsModal({ isOpen, onClose }: TodaySessionsModalProps) {
  const { sessions } = useAppStore()

  const todaySessions = sessions.filter(
    session => new Date(session.start_at).toDateString() === new Date().toDateString()
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Sessions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {todaySessions.map((session) => (
            <div
              key={session.id}
              className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
            >
              <div>
                <span className="font-medium">{session.type}</span>
                {session.task_id && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {session.task_id}
                  </span>
                )}
              </div>
              <span>{formatDuration(session.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
