import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerSession {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  country: string;
}

interface SessionState extends CustomerSession {
  setSession: (data: Partial<CustomerSession>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      country: '',
      setSession: (data) => set((prev) => ({ ...prev, ...data })),
      clearSession: () => set({ name: '', email: '', phone: '', company: '', address: '', country: '' }),
    }),
    { name: 'mammut-session' }
  )
);
