import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number | string;
    name: string;
    type?: string;
    material?: string;
    width?: number;
    height?: number;
    price: number;
    currency?: string;
    image: string;
    quantity: number;
    config?: any;
    pricing?: any;
    details?: string[];
    addedAt?: number;
}

interface CartStore {
    items: CartItem[];
    isCartOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: number | string) => void;
    updateQuantity: (id: number | string, delta: number) => void;
    toggleCart: () => void;
    clearCart: () => void;
    getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(i => i.id === newItem.id);
          if (existing) {
             return { items: state.items.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i) };
          }
          return { items: [...state.items, { ...newItem, addedAt: Date.now() }] };
        });
        set({ isCartOpen: true });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id, delta) => set((state) => ({
        items: state.items.map(i => {
          if (i.id === id) {
             const newQ = Math.max(1, i.quantity + delta);
             return { ...i, quantity: newQ };
          }
          return i;
        })
      })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }),
    {
      name: 'drutex-cart-storage',
    }
  )
);
