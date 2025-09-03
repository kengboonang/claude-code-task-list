import { useState, useMemo } from 'react'
import { Calendar, Clock, CheckCircle, Target, TrendingUp, X } from 'lucide-react'
import type { Task, Session, DaySummary } from '../types'

interface DailyReviewProps {
  tasks: Task[]
  sessions: Session[]
  onClose: () => void
}

export function DailyReview({ tasks, sessions, onClose }: DailyReviewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString())

  const dailySummary = useMemo((): DaySummary => {
    const date = selectedDate
    const todaySessions = sessions.filter(s => 
      s.completed && s.start_at.toDateString() === date
    )
    
    const focusSessions = todaySessions.filter(s => s.type === 'focus')
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0)
    
    const completedToday = tasks.filter(t => 
      t.status === 'completed' && 
      t.updated_at.toDateString() === date
    )
    
    // Calculate focus score (planned vs completed ratio)
    const plannedMinutes = focusSessions.reduce((acc, s) => acc + s.planned_duration, 0)
    const focusScore = plannedMinutes > 0 ? Math.round((totalFocusMinutes / plannedMinutes) * 100) : 0
    
    return {
      date,
      total_focus_minutes: Math.round(totalFocusMinutes * 10) / 10,
      sessions_count: focusSessions.length,
      tasks_completed: completedToday.map(t => t.id),
      focus_score: focusScore
    }
  }, [tasks, sessions, selectedDate])

  const completedTasks = tasks.filter(t => dailySummary.tasks_completed.includes(t.id))
  const completedMIT = completedTasks.find(t => t.is_mit)
  
  const todayFocusSessions = sessions.filter(s => 
    s.type === 'focus' && 
    s.completed && 
    s.start_at.toDateString() === selectedDate
  )

  const rolloverTasks = tasks.filter(t => 
    t.status === 'todo' || t.status === 'in_progress'
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const isToday = selectedDate === new Date().toDateString()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Daily Review
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Date Picker */}
          <div className="mt-4">
            <input
              type="date"
              value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value).toDateString())}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isToday && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Today
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {dailySummary.sessions_count === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No focus sessions</h3>
              <p className="text-gray-500">
                {isToday ? "You haven't completed any focus sessions today yet." : "No focus sessions were completed on this date."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">
                    {formatDuration(dailySummary.total_focus_minutes)}
                  </div>
                  <div className="text-sm text-blue-600">Focus Time</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {dailySummary.sessions_count}
                  </div>
                  <div className="text-sm text-green-600">Sessions</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">
                    {completedTasks.length}
                  </div>
                  <div className="text-sm text-purple-600">Tasks Done</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getScoreColor(dailySummary.focus_score)}`}>
                    {dailySummary.focus_score}%
                  </div>
                  <div className="text-sm text-yellow-600">Focus Score</div>
                </div>
              </div>

              {/* Focus Score Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Focus Performance</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {getScoreLabel(dailySummary.focus_score)} - You completed {dailySummary.focus_score}% of your planned focus time
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dailySummary.focus_score >= 90 ? 'bg-green-100 text-green-800' :
                    dailySummary.focus_score >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getScoreLabel(dailySummary.focus_score)}
                  </div>
                </div>
              </div>

              {/* MIT Achievement */}
              {completedMIT && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">MIT Completed! 🎉</h3>
                      <p className="text-yellow-800">
                        You completed your Most Important Task: <strong>{completedMIT.title}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tasks Completed ({completedTasks.length})</h3>
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-900">{task.title}</span>
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
                          {task.subtasks.length > 0 && (
                            <div className="text-sm text-green-700 mt-1">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks completed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Focus Sessions ({todayFocusSessions.length})</h3>
                <div className="space-y-2">
                  {todayFocusSessions.map(session => {
                    const task = tasks.find(t => t.id === session.task_id)
                    return (
                      <div key={session.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-900">
                              {task?.title || 'Quick Focus Session'}
                            </div>
                            <div className="text-sm text-blue-600">
                              {session.start_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {session.end_at?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {session.notes && (
                              <div className="text-sm text-gray-600 mt-1">"{session.notes}"</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-900">
                              {formatDuration(session.duration)}
                            </div>
                            <div className="text-xs text-blue-600">
                              of {formatDuration(session.planned_duration)} planned
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rollover Tasks */}
              {isToday && rolloverTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tomorrow's Focus ({rolloverTasks.length} tasks)</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm mb-3">
                      These tasks will roll over to tomorrow. Consider picking a new MIT for tomorrow.
                    </p>
                    <div className="space-y-2">
                      {rolloverTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'P1' ? 'bg-red-500' :
                            task.priority === 'P2' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-amber-900">{task.title}</span>
                          {task.is_mit && (
                            <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">MIT</span>
                          )}
                        </div>
                      ))}
                      {rolloverTasks.length > 5 && (
                        <div className="text-sm text-amber-700">
                          ... and {rolloverTasks.length - 5} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}