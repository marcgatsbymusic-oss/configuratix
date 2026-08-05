import { useState, useEffect } from 'react'
import { Sun, Moon, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../../store/useThemeStore'

export function ThemeHintPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)
  const { theme } = useThemeStore()
  const { t } = useTranslation()

  useEffect(() => {
    // Only show if not dismissed previously in this session
    const dismissed = sessionStorage.getItem('themeHintDismissed')
    if (dismissed) {
      setHasBeenDismissed(true)
      return
    }

    // Show after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setHasBeenDismissed(true)
    sessionStorage.setItem('themeHintDismissed', 'true')
  }

  if (hasBeenDismissed) return null

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-mammut-darker border border-mammut-gold/50 shadow-2xl p-5 transition-all duration-700 ease-out transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}
      `}
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-mammut-white/50 hover:text-mammut-gold transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 bg-mammut-dark flex items-center justify-center border border-mammut-border text-mammut-gold">
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </div>
        
        <div>
          <h4 className="text-sm font-black uppercase text-mammut-white tracking-widest mb-1">
            {t('themeHint.title')}
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: '#ffffff' }}>
            {t('themeHint.description')}
          </p>
          
          <button 
            onClick={handleDismiss}
            className="mt-4 text-[10px] font-bold uppercase tracking-widest text-mammut-gold hover:text-mammut-white transition-colors"
          >
            {t('themeHint.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
