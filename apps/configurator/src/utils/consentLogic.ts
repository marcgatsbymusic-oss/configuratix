import { useConsentStore } from '../store/useConsentStore'

// Ensure gtag is defined for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Initializes Consent Mode v2 based on the current state.
 * Should be called very early in the application lifecycle.
 */
export function initConsentLogic() {
  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag if it doesn't exist
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }

  // Subscribe to changes in the consent store
  useConsentStore.subscribe((state, prevState) => {
    // Only fire update if choices actually changed or user answered
    if (state.hasAnswered !== prevState.hasAnswered || 
        state.choices.analytics !== prevState.choices.analytics || 
        state.choices.marketing !== prevState.choices.marketing) {
      
      updateGtagConsent(state.choices);
      
      // If the user just answered or updated, log the audit record
      if (state.hasAnswered) {
        logConsentAudit(state.choices);
      }
    }
  });

  // Apply initial consent state
  const currentState = useConsentStore.getState();
  
  // Set default state BEFORE checking if answered. 
  // Under Consent Mode v2, we must always set a default state on every page load.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // If user already answered previously, update it immediately
  if (currentState.hasAnswered) {
    updateGtagConsent(currentState.choices);
  }
}

/**
 * Updates the gtag configuration based on the user's granular choices.
 */
function updateGtagConsent(choices: { analytics: boolean, marketing: boolean }) {
  window.gtag('consent', 'update', {
    analytics_storage: choices.analytics ? 'granted' : 'denied',
    ad_storage: choices.marketing ? 'granted' : 'denied',
    ad_user_data: choices.marketing ? 'granted' : 'denied',
    ad_personalization: choices.marketing ? 'granted' : 'denied'
  });
}

/**
 * Logs the consent choices to our lightweight backend for audit purposes.
 * Complies with GDPR requirement to prove WHEN and HOW a user gave consent.
 */
async function logConsentAudit(choices: { necessary: boolean, analytics: boolean, marketing: boolean }) {
  try {
    // Determine the host based on Vite environment, assuming server runs on 3001
    // For simplicity in this implementation, we use an absolute URL if in dev, or relative if proxied
    const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/log-consent' : '/api/log-consent';
    
    // We send the current URL, User-Agent, and choices.
    // The backend will generate the hash using the client IP + User-Agent for privacy-preserving auditing.
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        choices,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    // Silent fail to avoid disrupting UX, but could log to Sentry in a real app
    console.warn('Could not log consent audit:', err);
  }
}
