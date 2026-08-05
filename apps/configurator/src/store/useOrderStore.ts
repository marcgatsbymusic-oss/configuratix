import { create } from 'zustand';

export interface OrderItem {
  id: string; // unique internal id
  index: number; // 1 to total
  
  // From Step 7 (Room Name)
  roomName: string; 
  roomType: string;
  orientation: string;
  quantity: number;
  
  // Basic properties
  itemType: 'window' | 'balcony_door' | 'sliding_door' | 'house_door' | 'garage_door';
  
  // Global Presets from Wizard
  material: string;
  profile: string;
  glazing: string;
  
  // Item Presets from Wizard
  windowType: string;
  openings: string[];
  blinds: string;
  
  // The actual saved config from the configurator output
  savedConfig: any | null; 
  isConfigured: boolean;
}

interface OrderStore {
  isActive: boolean;
  orderNumber: string | null;
  items: OrderItem[];
  currentIndex: number;
  questionnaireDiscount: number;

  startOrder: (items: Omit<OrderItem, 'id' | 'savedConfig' | 'isConfigured'>[]) => void;
  saveCurrentAndNext: (configState: any) => void;
  skipCurrent: () => void;
  goToPrevious: () => void;
  finishOrder: () => void;
  cancelOrder: () => void;
  setDiscount: (discount: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateOrderNumber = () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

export const useOrderStore = create<OrderStore>((set, get) => ({
  isActive: false,
  orderNumber: null,
  items: [],
  currentIndex: 0,
  questionnaireDiscount: 0,

  startOrder: (initialItems) => {
    const items: OrderItem[] = initialItems.map(item => ({
      ...item,
      id: generateId(),
      savedConfig: null,
      isConfigured: false
    }));
    
    set({
      isActive: true,
      orderNumber: generateOrderNumber(),
      items,
      currentIndex: 0
    });
  },

  saveCurrentAndNext: (configState) => {
    const state = get();
    if (!state.isActive || state.currentIndex >= state.items.length) return;

    const newItems = [...state.items];
    newItems[state.currentIndex] = {
      ...newItems[state.currentIndex],
      savedConfig: configState,
      isConfigured: true
    };

    set({
      items: newItems,
      currentIndex: state.currentIndex + 1
    });
  },
  
  skipCurrent: () => {
     set(state => ({ currentIndex: state.currentIndex + 1 }));
  },

  goToPrevious: () => {
    set(state => ({ currentIndex: Math.max(0, state.currentIndex - 1) }));
  },

  finishOrder: () => {
    // In a real app we would dispatch to cart/backend here
    set({
      isActive: false,
      items: [],
      currentIndex: 0,
      questionnaireDiscount: 0
    });
  },

  cancelOrder: () => {
    set({
      isActive: false,
      orderNumber: null,
      items: [],
      currentIndex: 0,
      questionnaireDiscount: 0
    });
  },
  
  setDiscount: (discount) => set({ questionnaireDiscount: discount })
}));
