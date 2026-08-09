import type { IntentFilters } from '@/mocks/destinations';
import { create } from 'zustand';

export type SavedDestination = {
  id: string;
  name: string;
  thumbnail: string;
  matchScore: number;
};

type AiFlowState = {
  filters: IntentFilters;
  setFilters: (partial: IntentFilters) => void;
  resetFilters: () => void;
  savedDestinations: SavedDestination[];
  saveDestination: (dest: SavedDestination) => void;
  unsaveDestination: (id: string) => void;
};

export const useAiFlowStore = create<AiFlowState>((set) => ({
  filters: {},
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: {} }),
  savedDestinations: [],
  saveDestination: (dest) => set((s) => {
    if (s.savedDestinations.find(d => d.id === dest.id)) return s;
    return { savedDestinations: [dest, ...s.savedDestinations] };
  }),
  unsaveDestination: (id) => set((s) => ({
    savedDestinations: s.savedDestinations.filter(d => d.id !== id)
  })),
}));
