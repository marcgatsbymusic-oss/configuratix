import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useConsentStore } from '../../store/useConsentStore'

export function CookieConsentModal() {
  const { hasAnswered, choices, setConsent, acceptAll, rejectAll } = useConsentStore()
  const [showPreferences, setShowPreferences] = useState(false)
  const [draftChoices, setDraftChoices] = useState(choices)

  // Do not render if the user has already answered
  if (hasAnswered) return null

  const handleSavePreferences = () => {
    setConsent(draftChoices)
  }

  const toggleDraft = (key: keyof typeof draftChoices) => {
    if (key === 'necessary') return // Cannot toggle necessary
    setDraftChoices(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Identical styling for Accept/Reject buttons to comply with 2026 anti-dark pattern regulations
  const primaryButtonClass = "flex-1 py-3 px-4 font-bold text-sm tracking-widest uppercase transition-colors border border-mammut-gold text-mammut-gold hover:bg-mammut-gold hover:text-black"

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-mammut-black/80 backdrop-blur-sm">
      <div className="bg-mammut-darker border border-mammut-border max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-mammut-border flex items-center gap-3 bg-mammut-dark">
          <ShieldCheck className="text-mammut-gold shrink-0" size={28} />
          <h2 className="text-xl font-black text-mammut-white uppercase tracking-widest">
            Privacy & Cookie Preferences
          </h2>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {!showPreferences ? (
            <div className="space-y-4">
              <p className="text-sm text-mammut-white leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
              <p className="text-sm text-mammut-white leading-relaxed">
                To comply with the strict 2026 GDPR and ePrivacy directives, we ensure no tracking occurs before you explicitly opt in, and you can withdraw consent at any time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-mammut-white">
                  Manage your granular consent preferences below. Necessary cookies cannot be disabled as they are required for the website to function securely.
                </p>
              </div>

              {/* Necessary Toggle */}
              <div className="flex items-start justify-between gap-4 p-4 border border-mammut-border bg-white/5 opacity-70">
                <div className="flex-1">
                  <h4 className="font-bold text-mammut-white uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                    Necessary 
                    <span className="text-[9px] bg-mammut-gold text-black px-1.5 py-0.5 rounded-sm">Always Active</span>
                  </h4>
                  <p className="text-xs text-mammut-white">
                    Required for core site functionality, security, and storing your privacy preferences.
                  </p>
                </div>
                <div className="shrink-0 relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" checked readOnly className="sr-only peer" />
                  <div className="w-11 h-6 bg-mammut-gold rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
              </div>

              {/* Analytics Toggle */}
              <div className="flex items-start justify-between gap-4 p-4 border border-mammut-border hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleDraft('analytics')}>
                <div className="flex-1">
                  <h4 className="font-bold text-mammut-white uppercase tracking-widest text-sm mb-1">
                    Analytics
                  </h4>
                  <p className="text-xs text-mammut-white">
                    Allows us to understand how visitors interact with the site, gather anonymous usage statistics, and improve our services.
                  </p>
                </div>
                <div className="shrink-0 relative inline-flex items-center cursor-pointer pointer-events-none">
                  <input type="checkbox" checked={draftChoices.analytics} readOnly className="sr-only peer" />
                  <div className={`w-11 h-6 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all ${draftChoices.analytics ? 'bg-mammut-gold after:translate-x-full' : 'bg-mammut-border'}`}></div>
                </div>
              </div>

              {/* Marketing Toggle */}
              <div className="flex items-start justify-between gap-4 p-4 border border-mammut-border hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleDraft('marketing')}>
                <div className="flex-1">
                  <h4 className="font-bold text-mammut-white uppercase tracking-widest text-sm mb-1">
                    Marketing & Personalization
                  </h4>
                  <p className="text-xs text-mammut-white">
                    Used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.
                  </p>
                </div>
                <div className="shrink-0 relative inline-flex items-center cursor-pointer pointer-events-none">
                  <input type="checkbox" checked={draftChoices.marketing} readOnly className="sr-only peer" />
                  <div className={`w-11 h-6 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all ${draftChoices.marketing ? 'bg-mammut-gold after:translate-x-full' : 'bg-mammut-border'}`}></div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-mammut-border bg-mammut-dark flex flex-col sm:flex-row items-center gap-4">
          
          {!showPreferences ? (
            <>
              {/* Anti-Dark-Pattern: Identical visual weight for Accept and Reject */}
              <button 
                onClick={rejectAll}
                className={primaryButtonClass}
              >
                Reject All
              </button>
              <button 
                onClick={acceptAll}
                className={primaryButtonClass}
              >
                Accept All
              </button>
              
              <button 
                onClick={() => setShowPreferences(true)}
                className="w-full sm:w-auto py-3 px-4 font-bold text-sm tracking-widest uppercase text-mammut-white/60 hover:text-mammut-white transition-colors underline decoration-mammut-white/30 hover:decoration-mammut-white"
              >
                Manage Preferences
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowPreferences(false)}
                className="w-full sm:w-auto py-3 px-4 font-bold text-sm tracking-widest uppercase text-mammut-white/60 hover:text-mammut-white transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSavePreferences}
                className="flex-1 py-3 px-4 font-bold text-sm tracking-widest uppercase transition-colors bg-mammut-gold text-black hover:bg-white"
              >
                Save Preferences
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
