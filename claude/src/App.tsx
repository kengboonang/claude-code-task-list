import { useEffect, useState } from 'react'
import { AutoResumeCountdown } from './components/AutoResumeCountdown'
import { FocusMode } from './components/FocusMode'
import { TodayView } from './components/TodayView'
import { useAppStore } from './stores/useAppStore'
import type { SessionType } from './types'

function App() {
  const {
    tasks,
    sessions,
    currentSession,
    userPrefs,
    isInFocusMode,
    currentTaskId,
    createTask,
    updateTask,
    deleteTask,
    setMIT,
    startSession,
    completeSession,
    getTodayTasks,
    getActiveTodayTasks,
    getMIT,
    getCompletedMIT,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderTasks,
    calculateAdaptiveBreakDuration,
    resetAllData,
    resetDailyData,
    startTimer,
  } = useAppStore()

  const [sessionType, setSessionType] = useState<SessionType>('focus')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showAutoResumeCountdown, setShowAutoResumeCountdown] = useState(false)
  const [nextSession, setNextSession] = useState<{
    type: SessionType
    taskId?: string
    duration?: number
  } | null>(null)

  const todayTasks = getTodayTasks()
  const mit = getMIT()
  const completedMIT = getCompletedMIT()
  const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) || null : null

  useEffect(() => {
    // Request notification permission on app load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleStartFocus = (taskId: string) => {
    startSession('focus', taskId)
    setSessionType('focus')
  }

  const handleStartQuickFocus = () => {
    startSession('focus')
    setSessionType('focus')
  }

  const handleSessionComplete = (notes?: string, completeTask?: boolean, continueSession?: boolean, newSubtaskTitle?: string) => {
    completeSession(notes)

    // Complete the task if requested
    if (completeTask && currentTask) {
      updateTask(currentTask.id, { status: 'completed' })
    }

    // Add subtask if requested
    if (newSubtaskTitle && currentTask) {
      addSubtask(currentTask.id, newSubtaskTitle)
    }

    // Continue with another pomodoro immediately
    if (continueSession && sessionType === 'focus') {
      startSession('focus', currentTask?.id)
      return
    }

    if (sessionType === 'focus') {
      setCompletedPomodoros(prev => prev + 1)

      // Determine next session type
      const shouldTakeLongBreak = (completedPomodoros + 1) % userPrefs.cycles_to_long_break === 0
      const nextSessionType: SessionType = shouldTakeLongBreak ? 'long_break' : 'short_break'

      if (userPrefs.auto_resume) {
        // Show countdown for break session with adaptive duration
        const adaptiveDuration = calculateAdaptiveBreakDuration(nextSessionType)
        setNextSession({
          type: nextSessionType,
          duration: adaptiveDuration
        })
        setShowAutoResumeCountdown(true)
      } else {
        setSessionType(nextSessionType)
      }
    } else {
      // Break completed, ready for next focus session
      if (userPrefs.auto_resume && currentTask) {
        setNextSession({
          type: 'focus',
          taskId: currentTask.id
        })
        setShowAutoResumeCountdown(true)
      } else {
        setSessionType('focus')
      }
    }
  }

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' })

    // If this was the MIT, clear it
    const task = tasks.find(t => t.id === taskId)
    if (task?.is_mit) {
      // Don't clear MIT, just mark as completed - it shows achievement
    }
  }

  const handleExitFocus = () => {
    if (currentSession && !currentSession.completed) {
      completeSession('Session interrupted')
    }
    setSessionType('focus')
  }

  const handleAutoResumeStart = () => {
    if (nextSession) {
      startSession(nextSession.type, nextSession.taskId, nextSession.duration)
      setSessionType(nextSession.type)
      setShowAutoResumeCountdown(false)
      setNextSession(null)
    }
  }

  const handleAutoResumeCancel = () => {
    setShowAutoResumeCountdown(false)
    if (nextSession) {
      setSessionType(nextSession.type)
    }
    setNextSession(null)
  }

  // Reset pomodoro counter at start of new day
  useEffect(() => {
    const today = new Date().toDateString()
    const lastSession = sessions[sessions.length - 1]

    if (!lastSession || lastSession.start_at.toDateString() !== today) {
      setCompletedPomodoros(0)
    }
  }, [sessions])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isInFocusMode || currentSession ? (
        <FocusMode
          task={currentTask}
          sessionType={sessionType}
          userPrefs={userPrefs}
          onExitFocus={handleExitFocus}
          onSessionComplete={handleSessionComplete}
          onTaskComplete={handleTaskComplete}
          onAddSubtask={addSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
          startTimer={startTimer}
        />
      ) : (
        <TodayView
          todayTasks={todayTasks}
          activeTodayTasks={getActiveTodayTasks()}
          allTasks={tasks}
          mit={mit}
          completedMIT={completedMIT}
          sessions={sessions}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onSetMIT={setMIT}
          onStartFocus={handleStartFocus}
          onStartQuickFocus={handleStartQuickFocus}
          onAddSubtask={addSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
          onResetAllData={resetAllData}
          onResetDailyData={resetDailyData}
          onReorderTasks={reorderTasks}
        />
      )}

      {/* Auto Resume Countdown */}
      {showAutoResumeCountdown && nextSession && (
        <AutoResumeCountdown
          nextSessionType={nextSession.type}
          countdown={10}
          onAutoStart={handleAutoResumeStart}
          onCancel={handleAutoResumeCancel}
          nextTaskTitle={nextSession.taskId ? tasks.find(t => t.id === nextSession.taskId)?.title : undefined}
        />
      )}
    </div>
  )
}

export default App
