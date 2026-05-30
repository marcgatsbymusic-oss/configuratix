import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemConfig {
  typology: string;
  width: number;
  height: number;
  cExt: string;
  cInt: string;
  cGsk: string;
  cSpc: string;
  cExtTex?: string;
  cIntTex?: string;
}

export interface CartItem {
  id: string;
  config: CartItemConfig;
  snapshotBase64?: string; // Optional because it might be too large for localStorage, but we can store low-res
  price: number;
  summary: string;
  name: string;
  createdAt: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'window-configurator-cart',
    }
  )
);
