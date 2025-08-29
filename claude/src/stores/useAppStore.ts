import { useState, useCallback } from 'react'
import type { Task, Session, UserPrefs, AppState, SessionType } from '../types'

const DEFAULT_PREFS: UserPrefs = {
  pomo_length: 25,
  short_break_length: 5,
  long_break_length: 15,
  cycles_to_long_break: 4,
  auto_resume: true,
  dnd_enabled: false,
  sound_enabled: true,
}

const STORAGE_KEY = 'focus-app-state'

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
        })) || [],
        sessions: parsed.sessions?.map((session: any) => ({
          ...session,
          start_at: new Date(session.start_at),
          end_at: session.end_at ? new Date(session.end_at) : undefined,
        })) || [],
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
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const stored = loadFromStorage()
    return {
      tasks: [],
      sessions: [],
      currentSession: null,
      userPrefs: DEFAULT_PREFS,
      isInFocusMode: false,
      currentTaskId: null,
      ...stored,
    }
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
      created_at: new Date(),
      updated_at: new Date(),
    }
    
    updateState(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }))
    
    return task
  }, [updateState])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id 
          ? { ...task, ...updates, updated_at: new Date() }
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

  const startSession = useCallback((type: SessionType, taskId?: string) => {
    const session: Session = {
      id: generateId(),
      task_id: taskId,
      start_at: new Date(),
      duration: 0,
      type,
      completed: false,
    }

    updateState(prev => ({
      ...prev,
      currentSession: session,
      sessions: [...prev.sessions, session],
      isInFocusMode: type === 'focus',
      currentTaskId: taskId || null,
    }))

    return session
  }, [updateState])

  const completeSession = useCallback((notes?: string) => {
    updateState(prev => {
      if (!prev.currentSession) return prev

      const endTime = new Date()
      const durationMs = endTime.getTime() - prev.currentSession.start_at.getTime()
      const durationMinutes = Math.round(durationMs / 1000 / 60 * 10) / 10 // Round to 1 decimal place
      const duration = Math.max(0.1, durationMinutes) // Minimum 0.1 minutes (6 seconds)
      
      
      const completedSession = {
        ...prev.currentSession,
        end_at: endTime,
        duration,
        notes,
        completed: true,
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
      if (a.is_mit && !b.is_mit) return -1
      if (!a.is_mit && b.is_mit) return 1
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
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
    return state.tasks.find(task => task.is_mit && task.status === 'completed')
  }, [state.tasks])

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
    updatePrefs: (prefs: Partial<UserPrefs>) => 
      updateState({ userPrefs: { ...state.userPrefs, ...prefs } }),
  }
}