import { APP_THEMES, type AppearanceId, type AppColors } from '@/constants/appThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const THEME_KEY = 'urbanlens.appearance.v1';

type ThemeState = {
  appearance: AppearanceId;
  colors: AppColors;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAppearance: (appearance: AppearanceId) => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set) => ({
  appearance: 'advanced',
  colors: APP_THEMES.advanced,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(THEME_KEY);
      const appearance =
        raw === 'light' || raw === 'dark' || raw === 'advanced' ? raw : 'advanced';
      set({ appearance, colors: APP_THEMES[appearance], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setAppearance: async (appearance) => {
    set({ appearance, colors: APP_THEMES[appearance] });
    try {
      await AsyncStorage.setItem(THEME_KEY, appearance);
    } catch {
      // keep in-memory choice
    }
  },
}));
