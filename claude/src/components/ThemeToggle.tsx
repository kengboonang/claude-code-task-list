import { useTheme } from '../contexts/ThemeContext'
import type { Theme } from '../types'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative group">
      {/* Current theme button */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title={`Current: ${currentTheme.label} mode`}
      >
        <span className="text-lg">{currentTheme.icon}</span>
      </button>

      {/* Hover popup */}
      <div className="absolute right-0 top-12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 min-w-[120px]">
          {themes.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150
                ${theme === value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              title={`Switch to ${label.toLowerCase()} mode`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}