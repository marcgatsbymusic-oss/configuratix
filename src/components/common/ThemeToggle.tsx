import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/useThemeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-2 flex items-center justify-center"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
