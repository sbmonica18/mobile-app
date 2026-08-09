import { create } from 'zustand';

/** App-wide UI flags (non-auth). Auth lives in authStore. */
type AppState = {
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  hasSeenWelcome: false,
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
}));
