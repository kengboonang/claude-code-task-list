import { useState } from 'react'
import type { Task } from '../types'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onCreateTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onSetMIT: (taskId: string) => void
  onStartFocus: (taskId: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  title?: string
  showQuickAdd?: boolean
  showFocusButtons?: boolean
  onReorder?: (orderedIds: string[]) => void
}

export function TaskList({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onSetMIT,
  onStartFocus,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  title = 'Tasks',
  showQuickAdd = true,
  showFocusButtons = true,
  onReorder,
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<{ id: string, position: 'before' | 'after' } | null>(null)

  const handleToggleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      onUpdateTask(id, {
        status: task.status === 'completed' ? 'todo' : 'completed'
      })
    }
  }

  const handleToggleMIT = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      onSetMIT(task.is_mit ? '' : id)
    }
  }

  const handleEditTask = (updatedTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, updatedTask)
      setEditingTask(null)
    }
  }

  const handleDragStart = (taskId: string, e: any) => {
    if (!onReorder) return
    setDraggingId(taskId)
    try {
      e.dataTransfer?.setData('text/plain', taskId)
      e.dataTransfer!.effectAllowed = 'move'
    } catch {}
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOver(null)
  }

  const arrayMove = (arr: string[], from: number, to: number) => {
    const copy = arr.slice()
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
  }

  const handleDragOver = (targetId: string, e: any) => {
    if (!onReorder || !draggingId) return
    if (draggingId === targetId) {
      setDragOver(null)
      return
    }
    e.preventDefault()
    try {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
      const offsetY = e.clientY - rect.top
      const position: 'before' | 'after' = offsetY < rect.height / 2 ? 'before' : 'after'
      setDragOver({ id: targetId, position })
    } catch {
      setDragOver({ id: targetId, position: 'before' })
    }
  }

  const handleDropOn = (targetId: string) => {
    if (!onReorder || !draggingId) return
    if (draggingId === targetId) return
    const ids = tasks.map(t => t.id)
    const from = ids.indexOf(draggingId)
    let to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return

    const position = dragOver?.id === targetId ? dragOver.position : 'before'
    if (position === 'after') {
      to = to + 1
    }

    const adjustedTo = from < to ? Math.max(0, to - 1) : to

    const newOrder = arrayMove(ids, from, adjustedTo)
    onReorder(newOrder)
    setDraggingId(null)
    setDragOver(null)
  }

  if (editingTask) {
    return (
      <div className="space-y-4">
        <TaskForm
          initialData={editingTask}
          onSubmit={handleEditTask}
          onCancel={() => setEditingTask(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

      {showQuickAdd && (
        <TaskForm
          onSubmit={onCreateTask}
          isQuickAdd
        />
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              onDragOver={onReorder ? (e) => handleDragOver(task.id, e) : undefined}
              onDragLeave={onReorder ? () => { if (dragOver?.id === task.id) setDragOver(null) } : undefined}
              onDrop={onReorder ? () => handleDropOn(task.id) : undefined}
            >
              {onReorder && draggingId && dragOver?.id === task.id && dragOver.position === 'before' && (
                <div className="h-2 rounded bg-primary-400/50 animate-pulse my-1 transition-all" />
              )}
              <TaskItem
                task={task}
                onToggleComplete={handleToggleComplete}
                onToggleMIT={handleToggleMIT}
                onStartFocus={onStartFocus}
                onEdit={setEditingTask}
                onDelete={onDeleteTask}
                onAddSubtask={onAddSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onUpdateTask={onUpdateTask}
                showFocusButton={showFocusButtons}
                onDragStart={onReorder ? handleDragStart : undefined}
                onDragEnd={onReorder ? handleDragEnd : undefined}
              />
              {onReorder && draggingId && dragOver?.id === task.id && dragOver.position === 'after' && (
                <div className="h-2 rounded bg-primary-400/50 animate-pulse my-1 transition-all" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
