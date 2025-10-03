import { CheckCircle, Circle, Clock, Edit, GripVertical, Play, Star, StarOff, Trash2 } from 'lucide-react'
import type { DragEvent as ReactDragEvent } from 'react'
import type { Task, TaskPriority } from '../types'
import { SubtaskList } from './SubtaskList'

interface TaskItemProps {
  task: Task
  onToggleComplete: (id: string) => void
  onToggleMIT: (id: string) => void
  onStartFocus: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  showFocusButton?: boolean
  onDragStart?: (taskId: string, e: ReactDragEvent) => void
  onDragEnd?: (taskId: string, e: ReactDragEvent) => void
}

export function TaskItem({
  task,
  onToggleComplete,
  onToggleMIT,
  onStartFocus,
  onEdit,
  onDelete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onUpdateTask,
  showFocusButton = true,
  onDragStart,
  onDragEnd
}: TaskItemProps) {
  const priorityColors = {
    P1: 'border-l-red-500 bg-red-50',
    P2: 'border-l-yellow-500 bg-yellow-50',
    P3: 'border-l-green-500 bg-green-50',
  }

  const priorityTextColors = {
    P1: 'text-red-700',
    P2: 'text-yellow-700',
    P3: 'text-green-700',
  }

  return (
    <div className={`
      border-l-4 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow
      ${priorityColors[task.priority]}
      ${task.status === 'completed' ? 'opacity-60' : ''}
    `}>
      <div className="flex items-start gap-3">
        <button
          className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab"
          title="Drag to reorder"
          aria-label="Drag to reorder"
          draggable={!!onDragStart}
          onDragStart={(e) => onDragStart?.(task.id, e)}
          onDragEnd={(e) => onDragEnd?.(task.id, e)}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-0.5 text-gray-400 hover:text-primary-600"
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.notes && (
                <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {task.status !== 'completed' && (
                <button
                  onClick={() => onToggleMIT(task.id)}
                  className={`p-1 rounded ${task.is_mit ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title={task.is_mit ? 'Remove from MIT' : 'Set as Most Important Task'}
                >
                  {task.is_mit ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </button>
              )}

              {task.status === 'completed' && task.is_mit && (
                <div className="p-1 text-yellow-400" title="Was MIT">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              )}

              {showFocusButton && task.status !== 'completed' && (
                <button
                  onClick={() => onStartFocus(task.id)}
                  className="p-1 text-focus-600 hover:text-focus-700 rounded"
                  title="Start focus session"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs">
              <select
                aria-label="Priority"
                title="Priority"
                value={task.priority}
                onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as TaskPriority })}
                className={`px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 ${priorityTextColors[task.priority]} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>

              {task.estimate_pomos && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimate_pomos}p</span>
                </div>
              )}

              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-500 space-y-1 text-right">
              <div>
                {task.deadline ? (
                  `Deadline: ${new Date(task.deadline).toLocaleString()}`
                ) : (
                  'No deadline'
                )}
              </div>
              <div>
                {task.repeat ? (
                  `Repeats: ${task.repeat.frequency}`
                ) : (
                  'No repeat'
                )}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <SubtaskList
            taskId={task.id}
            subtasks={task.subtasks}
            onAddSubtask={onAddSubtask}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
            readonly={task.status === 'completed'}
          />
        </div>
      </div>
    </div>
  )
}
