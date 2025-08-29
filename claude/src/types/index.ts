export type TaskPriority = 'P1' | 'P2' | 'P3'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type SessionType = 'focus' | 'short_break' | 'long_break'

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
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  task_id?: string
  start_at: Date
  end_at?: Date
  duration: number
  type: SessionType
  notes?: string
  completed: boolean
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
}

export interface AppState {
  tasks: Task[]
  sessions: Session[]
  currentSession: Session | null
  userPrefs: UserPrefs
  isInFocusMode: boolean
  currentTaskId: string | null
}