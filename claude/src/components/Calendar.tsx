import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

/**
 * Format a Date into YYYY-MM-DD in local time (not UTC)
 */
function toLocalDateKey(d: Date) {
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().split('T')[0]
}

/**
 * Parse YYYY-MM-DD into a local Date
 */
function fromLocalDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m - 1), d)
}

interface CalendarProps {
  selectedDateKey: string
  onSelect: (dateKey: string) => void
  className?: string
}

export function Calendar({ selectedDateKey, onSelect, className }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    try {
      return fromLocalDateKey(selectedDateKey)
    } catch {
      return new Date()
    }
  })

  useEffect(() => {
    // Keep month in sync if parent changes selected date
    const sel = fromLocalDateKey(selectedDateKey)
    if (sel.getFullYear() !== visibleMonth.getFullYear() || sel.getMonth() !== visibleMonth.getMonth()) {
      setVisibleMonth(sel)
    }
  }, [selectedDateKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const todayKey = toLocalDateKey(new Date())
  const monthInfo = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = endOfMonth.getDate()

    // Determine leading blanks based on week starting on Sunday (0)
    const leadingBlanks = startOfMonth.getDay() // 0 (Sun) - 6 (Sat)

    const days: { key: string, date: number, isToday: boolean, isSelected: boolean }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const key = toLocalDateKey(date)
      days.push({
        key,
        date: d,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
      })
    }

    return {
      year,
      month,
      monthLabel: dateToMonthYearLabel(visibleMonth),
      leadingBlanks,
      days
    }
  }, [visibleMonth, selectedDateKey, todayKey])

  const gotoPrevMonth = () => {
    setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const gotoNextMonth = () => {
    setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const selectDay = (key: string) => {
    onSelect(key)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={gotoPrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
          title="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {monthInfo.monthLabel}
        </div>
        <button
          onClick={gotoNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
          title="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <div className="text-center py-1">Sun</div>
        <div className="text-center py-1">Mon</div>
        <div className="text-center py-1">Tue</div>
        <div className="text-center py-1">Wed</div>
        <div className="text-center py-1">Thu</div>
        <div className="text-center py-1">Fri</div>
        <div className="text-center py-1">Sat</div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading blanks */}
        {Array.from({ length: monthInfo.leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="h-8" />
        ))}

        {monthInfo.days.map(d => {
          const baseCls = 'h-8 flex items-center justify-center rounded-md text-sm cursor-pointer select-none'
          const selectedCls = d.isSelected ? 'bg-blue-600 text-white' : ''
          const todayRing = d.isToday && !d.isSelected ? 'ring-1 ring-blue-400' : ''
          const normalCls = !d.isSelected ? 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700' : ''
          return (
            <button
              key={d.key}
              onClick={() => selectDay(d.key)}
              className={`${baseCls} ${selectedCls} ${todayRing} ${normalCls}`}
              title={d.key}
            >
              {d.date}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function dateToMonthYearLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

export default Calendar
