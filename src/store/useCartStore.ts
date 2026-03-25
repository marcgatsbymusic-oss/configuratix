import { create } from 'zustand';
import type { ConfiguratorState } from '../components/SlateConfigurator/types';

export interface CartItem {
  id: string; // Unique ID for this cart array instance (e.g. UUID)
  timestamp: string;
  config: ConfiguratorState;
  pricing: {
    base: number;
    hardware: number;
    addons: number;
    total: number;
  };
  quantity: number;
  projectName?: string; // Optional label for the window (e.g. "Kitchen Front")
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'timestamp'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, { 
      ...item, 
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }] 
  })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
  updateQuantity: (id, qty) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item)
  })),
  clearCart: () => set({ items: [] }),
  cartTotal: () => get().items.reduce((sum, item) => sum + (item.pricing.total * item.quantity), 0)
}));
