import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark theme as requested
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', newTheme)
        return { theme: newTheme }
      }),
      setTheme: (theme: Theme) => set(() => {
        document.documentElement.setAttribute('data-theme', theme)
        return { theme }
      }),
    }),
    {
      name: 'mammut-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply the theme to the document when rehydrated from localStorage
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)
