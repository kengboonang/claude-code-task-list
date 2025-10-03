export type TaskPriority = 'P1' | 'P2' | 'P3'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type SessionType = 'focus' | 'short_break' | 'long_break'
export type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  created_at: Date
}

export interface RepeatConfig {
  frequency: RepeatFrequency
  interval: number
  ends: 'never' | 'on' | 'after'
  endDate?: Date
  occurrences?: number
}

export interface Task {
  id: string
  title: string
  notes?: string
  tags: string[]
  priority: TaskPriority
  estimate_pomos?: number
  due?: Date
  status: TaskStatus
  is_mit: boolean
  parent_id?: string
  subtasks: Subtask[]
  created_at: Date
  updated_at: Date
  sort_order?: number
  deadline?: string
  repeat?: RepeatConfig
}

export interface Session {
  id: string
  task_id?: string
  start_at: Date
  end_at?: Date
  duration: number
  planned_duration: number
  type: SessionType
  notes?: string
  completed: boolean
  completed_early: boolean
  extended: boolean
}

export interface DaySummary {
  date: string
  total_focus_minutes: number
  sessions_count: number
  tasks_completed: string[]
  focus_score: number
}

export interface UserPrefs {
  pomo_length: number
  short_break_length: number
  long_break_length: number
  cycles_to_long_break: number
  auto_resume: boolean
  dnd_enabled: boolean
  sound_enabled: boolean
  adaptive_breaks: boolean
  min_break_length: number
  max_break_length: number
}

export interface AppState {
  tasks: Task[]
  sessions: Session[]
  currentSession: Session | null
  userPrefs: UserPrefs
  isInFocusMode: boolean
  currentTaskId: string | null
}

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
