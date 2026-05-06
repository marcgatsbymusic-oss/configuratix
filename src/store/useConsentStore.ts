import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ConsentChoices {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentState {
  hasAnswered: boolean;
  choices: ConsentChoices;
  setConsent: (choices: ConsentChoices) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reset: () => void;
}

const defaultChoices: ConsentChoices = {
  necessary: true, // Always true under GDPR
  analytics: false,
  marketing: false,
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      hasAnswered: false,
      choices: defaultChoices,
      setConsent: (choices) => {
        set({ choices: { ...choices, necessary: true }, hasAnswered: true })
      },
      acceptAll: () => {
        set({ 
          choices: { necessary: true, analytics: true, marketing: true }, 
          hasAnswered: true 
        })
      },
      rejectAll: () => {
        set({ 
          choices: { necessary: true, analytics: false, marketing: false }, 
          hasAnswered: true 
        })
      },
      reset: () => {
        set({ choices: defaultChoices, hasAnswered: false })
      }
    }),
    {
      name: 'mammut_cookie_consent',
    }
  )
)
