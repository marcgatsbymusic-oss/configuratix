import { Shield } from 'lucide-react'
import { useConsentStore } from '../../store/useConsentStore'

export function CookieConsentBadge() {
  const { hasAnswered, reset } = useConsentStore()

  // Only show the badge IF they have already answered (so they can withdraw or change)
  if (!hasAnswered) return null

  return (
    <button 
      onClick={reset}
      className="fixed bottom-4 left-4 z-[9999] bg-mammut-dark border border-mammut-gold/30 hover:border-mammut-gold p-3 rounded-full shadow-lg text-mammut-white/70 hover:text-mammut-gold transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-mammut-gold focus:ring-offset-2 focus:ring-offset-mammut-black"
      aria-label="Manage Privacy & Cookie Settings"
      title="Manage Privacy Settings"
    >
      <Shield size={20} />
      
      {/* Tooltip on hover */}
      <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-mammut-black border border-mammut-gold text-mammut-white text-[10px] uppercase tracking-widest px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Privacy Settings
      </span>
    </button>
  )
}
