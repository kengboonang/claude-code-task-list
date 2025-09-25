import { Check, Edit3, Plus, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import type { Subtask } from '../types'

interface SubtaskListProps {
  taskId: string
  subtasks: Subtask[]
  onAddSubtask: (taskId: string, title: string) => void
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: { title?: string, completed?: boolean }) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  readonly?: boolean
}

export function SubtaskList({
  taskId,
  subtasks,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  readonly = false
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    onAddSubtask(taskId, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
    // Keep the add form open and refocus the input to quickly add another
    setShowAddForm(true)
    inputRef.current?.focus()
  }

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingId(subtask.id)
    setEditingTitle(subtask.title)
  }

  const handleSaveEdit = (subtaskId: string) => {
    if (editingTitle.trim()) {
      onUpdateSubtask(taskId, subtaskId, { title: editingTitle.trim() })
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const completedCount = subtasks.filter(s => s.completed).length
  const totalCount = subtasks.length

  if (subtasks.length === 0 && readonly) {
    return null
  }

  return (
    <div className="mt-3">
      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtasks list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 group"
          >
            <button
              onClick={() => onUpdateSubtask(taskId, subtask.id, { completed: !subtask.completed })}
              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.completed
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              disabled={readonly}
            >
              {subtask.completed && <Check className="w-3 h-3" />}
            </button>

            {editingId === subtask.id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(subtask.id)
                    } else if (e.key === 'Escape') {
                      handleCancelEdit()
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(subtask.id)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-700'
                  }`}
                >
                  {subtask.title}
                </span>
                {!readonly && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => handleEditSubtask(subtask)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteSubtask(taskId, subtask.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      {!readonly && (
        <div className="mt-2">
          {showAddForm ? (
            <form onSubmit={handleAddSubtask} className="flex items-center gap-1">
              <input
                type="text"
                ref={inputRef}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 text-blue-600 hover:text-blue-700"
                disabled={!newSubtaskTitle.trim()}
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewSubtaskTitle('')
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add subtask
            </button>
          )}
        </div>
      )}
    </div>
  )
}
