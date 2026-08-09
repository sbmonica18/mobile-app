import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JourneyStoryPayload, JourneyStorySeed } from '@/types/journeyStory';
import { buildJourneyStory } from '@/mocks/journeyStory';
import { getAccountScopeId, scopedStorageKey } from '@/utils/accountScope';
import { create } from 'zustand';

const VAULT_BASE = 'urbanlens.travelVault.v2';

type JourneyStoryState = {
  current: JourneyStoryPayload | null;
  vault: JourneyStoryPayload[];
  hydrated: boolean;
  /** Scope id the in-memory vault belongs to */
  scopeId: string | null;
  beginStory: (seed: JourneyStorySeed) => JourneyStoryPayload;
  setCurrent: (story: JourneyStoryPayload | null) => void;
  resetForAccountChange: () => void;
  hydrateVault: () => Promise<void>;
  saveToVault: (story?: JourneyStoryPayload | null) => Promise<JourneyStoryPayload | null>;
  removeFromVault: (id: string) => Promise<void>;
  toggleMemoryFavorite: (memoryId: string) => void;
};

async function persistVault(scopeId: string, vault: JourneyStoryPayload[]) {
  try {
    await AsyncStorage.setItem(scopedStorageKey(VAULT_BASE, scopeId), JSON.stringify(vault));
  } catch {
    // ignore
  }
}

export const useJourneyStoryStore = create<JourneyStoryState>((set, get) => ({
  current: null,
  vault: [],
  hydrated: false,
  scopeId: null,

  beginStory: (seed) => {
    const story = buildJourneyStory(seed);
    set({ current: story });
    return story;
  },

  setCurrent: (story) => set({ current: story }),

  resetForAccountChange: () => {
    set({ current: null, vault: [], hydrated: false, scopeId: null });
  },

  hydrateVault: async () => {
    const scopeId = getAccountScopeId();
    try {
      const raw = await AsyncStorage.getItem(scopedStorageKey(VAULT_BASE, scopeId));
      if (!raw) {
        set({ vault: [], hydrated: true, scopeId });
        return;
      }
      const parsed = JSON.parse(raw) as JourneyStoryPayload[];
      if (Array.isArray(parsed)) {
        set({ vault: parsed, hydrated: true, scopeId });
      } else {
        set({ vault: [], hydrated: true, scopeId });
      }
    } catch {
      set({ vault: [], hydrated: true, scopeId });
    }
  },

  saveToVault: async (story) => {
    const target = story ?? get().current;
    if (!target) return null;
    const scopeId = getAccountScopeId();
    // Guard: never write into another account's in-memory vault
    if (get().scopeId && get().scopeId !== scopeId) {
      await get().hydrateVault();
    }
    const nextItem = { ...target, savedToVault: true };
    const without = get().vault.filter((v) => v.id !== nextItem.id);
    const vault = [nextItem, ...without].slice(0, 40);
    set({
      vault,
      scopeId,
      current: get().current?.id === nextItem.id ? nextItem : get().current,
    });
    await persistVault(scopeId, vault);
    return nextItem;
  },

  removeFromVault: async (id) => {
    const scopeId = getAccountScopeId();
    const vault = get().vault.filter((v) => v.id !== id);
    set({ vault, scopeId });
    await persistVault(scopeId, vault);
  },

  toggleMemoryFavorite: (memoryId) => {
    const current = get().current;
    if (!current) return;
    set({
      current: {
        ...current,
        memories: current.memories.map((m) =>
          m.id === memoryId ? { ...m, favorited: !m.favorited } : m,
        ),
      },
    });
  },
}));
