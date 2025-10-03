import { Calendar, Plus, Repeat, X } from 'lucide-react'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { RepeatConfig, RepeatFrequency, Task } from '../types'

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel?: () => void
  initialData?: Partial<Task>
  isQuickAdd?: boolean
}

export function TaskForm({ onSubmit, onCancel, initialData, isQuickAdd = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [estimatePomos, setEstimatePomos] = useState(initialData?.estimate_pomos?.toString() || '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [deadline, setDeadline] = useState<Date | null>(initialData?.deadline ? new Date(initialData.deadline) : null)
  const [repeat, setRepeat] = useState<RepeatConfig | null>(initialData?.repeat || null)
  const [showRepeatModal, setShowRepeatModal] = useState(false)

  const toggleRepeatModal = () => {
    setShowRepeatModal(!showRepeatModal)
  }

  const handleRepeatChange = (newRepeatConfig: RepeatConfig | null) => {
    setRepeat(newRepeatConfig)
    setShowRepeatModal(false)
  }

  const handleDeadlineChange = (date: Date | null) => {
    setDeadline(date)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority: 'P1', // Set default priority to P1
      estimate_pomos: estimatePomos ? parseInt(estimatePomos) : undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'todo',
      is_mit: false,
      subtasks: [],
      deadline: deadline ? deadline.toISOString() : undefined,
      repeat: repeat || undefined,
    })

    if (isQuickAdd) {
      setTitle('')
      setNotes('')
      setEstimatePomos('')
      setTags('')
      setDeadline(null)
      setRepeat(null)
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
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
        <DatePicker
          selected={deadline}
          onChange={handleDeadlineChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          customInput={
            <button
              type="button"
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent active:transform-none active:translate-x-0 active:translate-y-0 ${deadline ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
            >
              <Calendar className="w-6 h-6 active:transform-none active:translate-x-0 active:translate-y-0" />
            </button>
          }
        />
        <button
          type="button"
          onClick={toggleRepeatModal}
          className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent active:transform-none active:translate-x-0 active:translate-y-0 ${repeat ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          title={repeat ? `Repeats ${repeat.frequency}` : 'Set to repeat'}
        >
          <Repeat className="w-6 h-6 active:transform-none active:translate-x-0 active:translate-y-0" />
        </button>
        <RepeatModal
          isOpen={showRepeatModal}
          onClose={toggleRepeatModal}
          onRepeatChange={handleRepeatChange}
          currentRepeat={repeat}
        />
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimate (Pomodoros)
          </label>
          <input
            type="number"
            value={estimatePomos}
            onChange={(e) => setEstimatePomos(e.target.value)}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, project-alpha, urgent"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" className="btn-primary">
            {initialData ? 'Update' : 'Create'} Task
          </button>
          <DatePicker
            selected={deadline}
            onChange={handleDeadlineChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="MMMM d, yyyy h:mm aa"
            customInput={
              <button
                type="button"
                className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center active:transform-none active:translate-x-0 active:translate-y-0 ${deadline ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
              >
                <Calendar className="w-6 h-6 mr-2 active:transform-none active:translate-x-0 active:translate-y-0" />
                {deadline ? `Deadline: ${deadline.toLocaleString()}` : 'Set Deadline'}
              </button>
            }
          />
          <button
            type="button"
            onClick={toggleRepeatModal}
            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center active:transform-none active:translate-x-0 active:translate-y-0 ${repeat ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            <Repeat className="w-6 h-6 mr-2 active:transform-none active:translate-x-0 active:translate-y-0" />
            {repeat ? `Repeats ${repeat.frequency}` : 'Set to Repeat'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
      <RepeatModal
        isOpen={showRepeatModal}
        onClose={toggleRepeatModal}
        onRepeatChange={handleRepeatChange}
        currentRepeat={repeat}
      />
    </div>
  )
}

interface RepeatModalProps {
  isOpen: boolean
  onClose: () => void
  onRepeatChange: (repeat: RepeatConfig | null) => void
  currentRepeat: RepeatConfig | null
}

function RepeatModal({ isOpen, onClose, onRepeatChange, currentRepeat }: RepeatModalProps) {
  const [frequency, setFrequency] = useState<RepeatFrequency>(currentRepeat?.frequency || 'daily')

  if (!isOpen) return null

  const handleSave = () => {
    onRepeatChange({
      frequency,
      interval: 1,
      ends: 'never',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Set Repeat Options</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Repeat
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RepeatFrequency)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
