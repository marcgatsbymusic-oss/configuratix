import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  name: string;
  email: string;
  setSession: (name: string, email: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      setSession: (name, email) => set({ name, email }),
      clearSession: () => set({ name: '', email: '' }),
    }),
    { name: 'mammut-session' }
  )
);
