import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StagedWindow {
  id: string;
  name: string;
  profile: string;
  glazing: string;
  blindBox: boolean;
  motor: boolean;
  mosquito: boolean;
  config: any; // width, height, colors, etc.
  image?: string;
  createdAt: number;
  uwValue?: string;
}

export interface StagingArea {
  id: string;
  name: string;
  windows: StagedWindow[];
}

interface StagingStore {
  areas: StagingArea[];
  isDrawerOpen: boolean;
  addArea: (name: string) => void;
  renameArea: (areaId: string, name: string) => void;
  removeArea: (areaId: string) => void;
  addWindowToArea: (areaId: string, windowData: Omit<StagedWindow, 'id' | 'createdAt'>) => void;
  removeWindowFromArea: (areaId: string, windowId: string) => void;
  updateWindowInArea: (areaId: string, windowId: string, updates: Partial<StagedWindow>) => void;
  toggleDrawer: () => void;
}

export const useStagingStore = create<StagingStore>()(
  persist(
    (set) => ({
      areas: [
        { id: 'pilar_stq', name: 'pilar_stq', windows: [] }
      ],
      isDrawerOpen: false,
      addArea: (name) => set((state) => ({
        areas: [...state.areas, { id: Date.now().toString(36) + Math.random().toString(36).substring(2), name, windows: [] }]
      })),
      renameArea: (areaId, name) => set((state) => ({
        areas: state.areas.map(area =>
          area.id === areaId ? { ...area, name } : area
        )
      })),
      removeArea: (areaId) => set((state) => ({
        areas: state.areas.filter(area => area.id !== areaId)
      })),
      addWindowToArea: (areaId, windowData) => set((state) => {
        const newWindow: StagedWindow = {
          ...windowData,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          createdAt: Date.now()
        };
        
        const areaExists = state.areas.some(a => a.id === areaId);
        
        if (!areaExists) {
          // If for some reason the area got deleted but was still selected, create it on the fly
          return {
            areas: [...state.areas, { id: areaId, name: areaId, windows: [newWindow] }]
          };
        }

        return {
          areas: state.areas.map(area => 
            area.id === areaId 
              ? { ...area, windows: [...area.windows, newWindow] }
              : area
          )
        };
      }),
      removeWindowFromArea: (areaId, windowId) => set((state) => ({
        areas: state.areas.map(area =>
          area.id === areaId
            ? { ...area, windows: area.windows.filter(w => w.id !== windowId) }
            : area
        )
      })),
      updateWindowInArea: (areaId, windowId, updates) => set((state) => ({
        areas: state.areas.map(area =>
          area.id === areaId
            ? {
                ...area,
                windows: area.windows.map(w =>
                  w.id === windowId ? { ...w, ...updates } : w
                )
              }
            : area
        )
      })),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen }))
    }),
    {
      name: 'window-staging-storage',
    }
  )
);
