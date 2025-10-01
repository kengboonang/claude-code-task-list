import { useCallback, useState } from 'react'
import type { AppState, Session, SessionType, Task, UserPrefs } from '../types'

const DEFAULT_PREFS: UserPrefs = {
  pomo_length: 25,
  short_break_length: 5,
  long_break_length: 15,
  cycles_to_long_break: 4,
  auto_resume: true,
  dnd_enabled: false,
  sound_enabled: true,
  adaptive_breaks: true,
  min_break_length: 3,
  max_break_length: 10,
}

const STORAGE_KEY = 'focus-app-state'
const LAST_ACTIVITY_KEY = 'focus-app-last-activity'

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function loadFromStorage(): Partial<AppState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        tasks: parsed.tasks?.map((task: any) => ({
          ...task,
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
          due: task.due ? new Date(task.due) : undefined,
          subtasks: task.subtasks?.map((subtask: any) => ({
            ...subtask,
            created_at: new Date(subtask.created_at),
          })) || [],
        })) || [],
        sessions: parsed.sessions?.map((session: any) => ({
          ...session,
          start_at: new Date(session.start_at),
          end_at: session.end_at ? new Date(session.end_at) : undefined,
        })) || [],
        // Always start with no active session
        currentSession: null,
        isInFocusMode: false,
      }
    }
  } catch (error) {
    console.error('Failed to load from storage:', error)
  }
  return {}
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toDateString())
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

function shouldResetForNewDay(): boolean {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
    const today = new Date().toDateString()
    return !!(lastActivity && lastActivity !== today)
  } catch (error) {
    return false
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const stored = loadFromStorage()
    let initialState: AppState = {
      tasks: [],
      sessions: [],
      currentSession: null,
      userPrefs: DEFAULT_PREFS,
      isInFocusMode: false,
      currentTaskId: null,
      ...stored,
    }

    // Auto-reset daily data if it's a new day
    if (shouldResetForNewDay() && initialState.tasks.length > 0) {
      initialState = {
        ...initialState,
        tasks: initialState.tasks.map(task => ({
          ...task,
          is_mit: false,
          // Preserve status on new day; do not reopen completed tasks automatically
          updated_at: new Date()
        })),
        currentSession: null,
        isInFocusMode: false,
        currentTaskId: null,
      }
      // Mark last activity as today to avoid repeating the daily reset on subsequent reloads
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toDateString())
      } catch (e) {
        // no-op
      }
    }

    return initialState
  })

  const updateState = useCallback((updater: Partial<AppState> | ((prev: AppState) => AppState)) => {
    setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveToStorage(newState)
      return newState
    })
  }, [])

  const createTask = useCallback((taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const task: Task = {
      ...taskData,
      id: generateId(),
      subtasks: taskData.subtasks || [],
      created_at: new Date(),
      updated_at: new Date(),
    }

    updateState(prev => ({
      ...prev,
      tasks: [task, ...prev.tasks]
    }))

    return task
  }, [updateState])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updated_at: updates.status === 'completed' && task.status !== 'completed'
                ? new Date() // Only update timestamp when marking as completed
                : task.updated_at
            }
          : task
      )
    }))
  }, [updateState])

  const deleteTask = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id)
    }))
  }, [updateState])

  const setMIT = useCallback((taskId: string) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => ({
        ...task,
        is_mit: task.id === taskId,
        updated_at: task.id === taskId ? new Date() : task.updated_at
      }))
    }))
  }, [updateState])

  const startSession = useCallback((type: SessionType, taskId?: string, customDuration?: number) => {
    const getPlannedDuration = () => {
      if (customDuration) return customDuration

      switch (type) {
        case 'focus':
          return state.userPrefs.pomo_length
        case 'short_break':
          return state.userPrefs.short_break_length
        case 'long_break':
          return state.userPrefs.long_break_length
        default:
          return 25
      }
    }

    const session: Session = {
      id: generateId(),
      task_id: taskId || undefined, // Allow undefined for taskless sessions
      start_at: new Date(),
      duration: 0,
      planned_duration: getPlannedDuration(),
      type,
      completed: false,
      completed_early: false,
      extended: false,
    }

    updateState(prev => ({
      ...prev,
      currentSession: session,
      sessions: [...prev.sessions, session],
      isInFocusMode: type === 'focus',
      currentTaskId: taskId || null,
    }))

    return session
  }, [updateState, state.userPrefs.pomo_length, state.userPrefs.short_break_length, state.userPrefs.long_break_length])

  const completeSession = useCallback((notes?: string, wasExtended?: boolean) => {
    updateState(prev => {
      if (!prev.currentSession) return prev

      const endTime = new Date()
      const durationMs = endTime.getTime() - prev.currentSession.start_at.getTime()
      const durationMinutes = Math.round(durationMs / 1000 / 60 * 10) / 10
      const duration = Math.max(0.1, durationMinutes)

      const plannedDurationMinutes = prev.currentSession.planned_duration
      const completedEarly = duration < (plannedDurationMinutes * 0.8) // 80% threshold

      const completedSession = {
        ...prev.currentSession,
        end_at: endTime,
        duration,
        notes,
        completed: true,
        completed_early: completedEarly,
        extended: wasExtended || false,
      }

      return {
        ...prev,
        currentSession: null,
        sessions: prev.sessions.map(s =>
          s.id === prev.currentSession?.id ? completedSession : s
        ),
        isInFocusMode: false,
      }
    })
  }, [updateState])

  const getTodayTasks = useCallback(() => {
    return state.tasks.filter(task =>
      !task.due || task.due <= new Date()
    ).sort((a, b) => {
      // Always push completed tasks to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1

      // For active tasks, prefer manual sort order if set
      const aHasOrder = typeof a.sort_order === 'number'
      const bHasOrder = typeof b.sort_order === 'number'
      if (aHasOrder && bHasOrder) return (a.sort_order as number) - (b.sort_order as number)
      if (aHasOrder && !bHasOrder) return -1
      if (!aHasOrder && bHasOrder) return 1

      // Fallback to previous rules
      if (a.is_mit && !b.is_mit) return -1
      if (!a.is_mit && b.is_mit) return 1

      const recency = b.created_at.getTime() - a.created_at.getTime()
      if (recency !== 0) return recency
      return a.priority.localeCompare(b.priority)
    })
  }, [state.tasks])

  const getActiveTodayTasks = useCallback(() => {
    return getTodayTasks().filter(task => task.status !== 'completed')
  }, [getTodayTasks])

  const getMIT = useCallback(() => {
    return state.tasks.find(task => task.is_mit && task.status !== 'completed')
  }, [state.tasks])

const getCompletedMIT = useCallback(() => {
  const today = new Date().toDateString()
  return state.tasks.find(task =>
    task.is_mit &&
    task.status === 'completed' &&
    task.updated_at.toDateString() === today
  )
}, [state.tasks])

  const addSubtask = useCallback((taskId: string, subtaskTitle: string) => {
    const subtask = {
      id: generateId(),
      title: subtaskTitle.trim(),
      completed: false,
      created_at: new Date(),
    }

    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, subtask], updated_at: new Date() }
          : task
      )
    }))

    return subtask
  }, [updateState])

  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, ...updates }
                  : subtask
              ),
              updated_at: new Date()
            }
          : task
      )
    }))
  }, [updateState])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
              updated_at: new Date()
            }
          : task
      )
    }))
  }, [updateState])

  const reorderTasks = useCallback((orderedIds: string[]) => {
    updateState(prev => {
      const idToOrder = new Map<string, number>()
      orderedIds.forEach((id, index) => {
        idToOrder.set(id, index)
      })
      return {
        ...prev,
        tasks: prev.tasks.map(task =>
          idToOrder.has(task.id)
            ? { ...task, sort_order: idToOrder.get(task.id)!, updated_at: new Date() }
            : task
        )
      }
    })
  }, [updateState])

  const calculateAdaptiveBreakDuration = useCallback((breakType: 'short_break' | 'long_break') => {
    if (!state.userPrefs.adaptive_breaks) {
      return breakType === 'short_break'
        ? state.userPrefs.short_break_length
        : state.userPrefs.long_break_length
    }

    // Get recent focus sessions from today
    const today = new Date().toDateString()
    const recentFocusSessions = state.sessions
      .filter(session =>
        session.type === 'focus' &&
        session.completed &&
        session.start_at.toDateString() === today
      )
      .slice(-3) // Last 3 focus sessions

    if (recentFocusSessions.length === 0) {
      return breakType === 'short_break'
        ? state.userPrefs.short_break_length
        : state.userPrefs.long_break_length
    }

    // Calculate adjustment based on recent session patterns
    const avgCompletionRate = recentFocusSessions.reduce((acc, session) => {
      return acc + (session.duration / session.planned_duration)
    }, 0) / recentFocusSessions.length

    const earlyCompletions = recentFocusSessions.filter(s => s.completed_early).length
    const extensions = recentFocusSessions.filter(s => s.extended).length

    let adjustment = 0

    // If completing early frequently, reduce break time
    if (earlyCompletions >= 2) {
      adjustment -= 1
    }

    // If extending frequently, increase break time
    if (extensions >= 2) {
      adjustment += 2
    }

    // If consistently completing full sessions, maintain normal breaks
    if (avgCompletionRate >= 0.9 && earlyCompletions === 0 && extensions === 0) {
      adjustment = 0
    }

    const baseDuration = breakType === 'short_break'
      ? state.userPrefs.short_break_length
      : state.userPrefs.long_break_length

    const adaptedDuration = baseDuration + adjustment

    // Clamp between min and max
    return Math.max(
      state.userPrefs.min_break_length,
      Math.min(state.userPrefs.max_break_length, adaptedDuration)
    )
  }, [state.sessions, state.userPrefs])

  const resetAllData = useCallback(() => {
    const freshState: AppState = {
      tasks: [],
      sessions: [],
      currentSession: null,
      userPrefs: DEFAULT_PREFS,
      isInFocusMode: false,
      currentTaskId: null,
    }

    setState(freshState)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

const resetDailyData = useCallback(() => {
  updateState(prev => ({
    ...prev,
    tasks: prev.tasks.map(task => ({
      ...task,
      is_mit: false,
      // Preserve completed status and updated_at for completed tasks
      ...(task.status !== 'completed' && { updated_at: new Date() })
    })),
    currentSession: null,
    isInFocusMode: false,
    currentTaskId: null,
  }))
}, [updateState])

  return {
    ...state,
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
    updatePrefs: (prefs: Partial<UserPrefs>) =>
      updateState({ userPrefs: { ...state.userPrefs, ...prefs } }),
    resetAllData,
    resetDailyData,
  }
}

// Export utility functions for testing
export { shouldResetForNewDay }
