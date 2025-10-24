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
  const [showDeadlineDropdown, setShowDeadlineDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRepeatDatePicker, setShowRepeatDatePicker] = useState(false)
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false)
  const [showRepeatModal, setShowRepeatModal] = useState(false)

  const toggleDeadlineDropdown = () => {
    setShowDeadlineDropdown(!showDeadlineDropdown)
    if (!showDeadlineDropdown) {
      setShowRepeatDropdown(false)
    }
  }

  const toggleRepeatDropdown = () => {
    setShowRepeatDropdown(!showRepeatDropdown)
    if (!showRepeatDropdown) {
      setShowDeadlineDropdown(false)
    }
  }

  const getToday = () => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    return today
  }

  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999) // End of tomorrow
    return tomorrow
  }

  const getEndOfWeek = () => {
    const endOfWeek = new Date()
    const dayOfWeek = endOfWeek.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday)
    endOfWeek.setHours(23, 59, 59, 999) // End of Sunday
    return endOfWeek
  }

  const handleDeadlineSelect = (option: 'today' | 'tomorrow' | 'end_of_week' | 'custom') => {
    if (option === 'custom') {
      setShowDatePicker(true)
      setShowDeadlineDropdown(false)
    } else {
      let newDeadline: Date
      switch (option) {
        case 'today':
          newDeadline = getToday()
          break
        case 'tomorrow':
          newDeadline = getTomorrow()
          break
        case 'end_of_week':
          newDeadline = getEndOfWeek()
          break
        default:
          return
      }
      setDeadline(newDeadline)
      setShowDeadlineDropdown(false)
    }
  }

  const handleRepeatSelect = (frequency: RepeatFrequency | 'custom') => {
    if (frequency === 'custom') {
      setShowRepeatDatePicker(true)
      setShowRepeatDropdown(false)
    } else {
      setRepeat({
        frequency,
        interval: 1,
        ends: 'never',
      })
      setShowRepeatDropdown(false)
    }
  }

  const handleRepeatDateChange = (date: Date | null) => {
    if (date) {
      setRepeat({
        frequency: 'monthly',
        interval: 1,
        ends: 'never',
      })
    }
    setShowRepeatDatePicker(false)
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
        <div className="relative">
          <button
            type="button"
            onClick={toggleDeadlineDropdown}
            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent active:transform-none active:translate-x-0 active:translate-y-0 ${deadline ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
            title={deadline ? `Deadline: ${deadline.toLocaleString()}` : 'Set deadline'}
          >
            <Calendar className="w-6 h-6 active:transform-none active:translate-x-0 active:translate-y-0" />
          </button>
          {showDeadlineDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 animate-in slide-in-from-right-2 duration-200">
              <div className="flex flex-col p-1">
                <button
                  type="button"
                  onClick={() => handleDeadlineSelect('today')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlineSelect('tomorrow')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlineSelect('end_of_week')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  End of Week
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlineSelect('custom')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Custom
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={toggleRepeatDropdown}
            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent active:transform-none active:translate-x-0 active:translate-y-0 ${repeat ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
            title={repeat ? `Repeats ${repeat.frequency}` : 'Set to repeat'}
          >
            <Repeat className="w-6 h-6 active:transform-none active:translate-x-0 active:translate-y-0" />
          </button>
          {showRepeatDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 animate-in slide-in-from-right-2 duration-200">
              <div className="flex flex-col p-1">
                <button
                  type="button"
                  onClick={() => handleRepeatSelect('daily')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => handleRepeatSelect('weekly')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => handleRepeatSelect('monthly')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleRepeatSelect('custom')}
                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                >
                  Custom
                </button>
              </div>
            </div>
          )}
        </div>
        <RepeatModal
          isOpen={showRepeatModal}
          onClose={() => setShowRepeatModal(false)}
          onRepeatChange={handleRepeatChange}
          currentRepeat={repeat}
        />
        {showDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Set Custom Deadline</h3>
              <DatePicker
                selected={deadline}
                onChange={handleDeadlineChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                inline
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowDatePicker(false)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {showRepeatDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Select Day of Month</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose which day of each month this task should repeat
              </p>
              <DatePicker
                selected={new Date()}
                onChange={handleRepeatDateChange}
                dateFormat="MMMM d, yyyy"
                inline
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="btn-secondary"
                  onClick={() => setShowRepeatDatePicker(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
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
          <div className="relative">
            <button
              type="button"
              onClick={toggleDeadlineDropdown}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center active:transform-none active:translate-x-0 active:translate-y-0 ${deadline ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
            >
              <Calendar className="w-6 h-6 mr-2 active:transform-none active:translate-x-0 active:translate-y-0" />
              {deadline ? `Deadline: ${deadline.toLocaleString()}` : 'Set Deadline'}
            </button>
            {showDeadlineDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 animate-in slide-in-from-right-2 duration-200">
                <div className="flex flex-col p-1">
                  <button
                    type="button"
                    onClick={() => handleDeadlineSelect('today')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeadlineSelect('tomorrow')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeadlineSelect('end_of_week')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    End of Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeadlineSelect('custom')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={toggleRepeatDropdown}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center active:transform-none active:translate-x-0 active:translate-y-0 ${repeat ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
            >
              <Repeat className="w-6 h-6 mr-2 active:transform-none active:translate-x-0 active:translate-y-0" />
              {repeat ? `Repeats ${repeat.frequency}` : 'Set to Repeat'}
            </button>
            {showRepeatDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 animate-in slide-in-from-right-2 duration-200">
                <div className="flex flex-col p-1">
                  <button
                    type="button"
                    onClick={() => handleRepeatSelect('daily')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepeatSelect('weekly')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepeatSelect('monthly')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepeatSelect('custom')}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md whitespace-nowrap"
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
      <RepeatModal
        isOpen={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        onRepeatChange={handleRepeatChange}
        currentRepeat={repeat}
      />
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Set Custom Deadline</h3>
            <DatePicker
              selected={deadline}
              onChange={handleDeadlineChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn-secondary"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowDatePicker(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showRepeatDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Select Day of Month</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose which day of each month this task should repeat
            </p>
            <DatePicker
              selected={new Date()}
              onChange={handleRepeatDateChange}
              dateFormat="MMMM d, yyyy"
              inline
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn-secondary"
                onClick={() => setShowRepeatDatePicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
