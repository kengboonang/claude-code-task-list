import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Task, TaskPriority } from '../types'

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel?: () => void
  initialData?: Partial<Task>
  isQuickAdd?: boolean
}

export function TaskForm({ onSubmit, onCancel, initialData, isQuickAdd = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'P2')
  const [estimatePomos, setEstimatePomos] = useState(initialData?.estimate_pomos?.toString() || '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [showAdvanced, setShowAdvanced] = useState(!isQuickAdd)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      estimate_pomos: estimatePomos ? parseInt(estimatePomos) : undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'todo',
      is_mit: false,
    })

    if (isQuickAdd) {
      setTitle('')
      setNotes('')
      setEstimatePomos('')
      setTags('')
    }
  }

  if (isQuickAdd) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
        {!showAdvanced && (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="btn-secondary text-sm"
          >
            More
          </button>
        )}
      </form>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {initialData ? 'Edit Task' : 'New Task'}
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate (Pomodoros)
            </label>
            <input
              type="number"
              value={estimatePomos}
              onChange={(e) => setEstimatePomos(e.target.value)}
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, project-alpha, urgent"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="btn-primary">
            {initialData ? 'Update' : 'Create'} Task
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}