import { create } from 'zustand';

export interface ComparisonProperty {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface ComparisonState {
  properties: ComparisonProperty[];
  addProperty: (property: ComparisonProperty) => void;
  removeProperty: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  properties: [],
  isOpen: false,
  
  addProperty: (property) => set((state) => {
    if (state.properties.length >= 4) return state; // Limit to 4
    if (state.properties.find(p => p.id === property.id)) return state; // Avoid duplicates
    return { properties: [...state.properties, property], isOpen: true };
  }),
  
  removeProperty: (id) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== id),
    isOpen: state.properties.length - 1 > 0 ? state.isOpen : false,
  })),
  
  clear: () => set({ properties: [], isOpen: false }),
  
  setIsOpen: (isOpen) => set({ isOpen }),
}));
