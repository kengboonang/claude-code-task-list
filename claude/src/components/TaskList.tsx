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
  showFocusButtons = true
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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
            <TaskItem
              key={task.id}
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
            />
          ))
        )}
      </div>
    </div>
  )
}
