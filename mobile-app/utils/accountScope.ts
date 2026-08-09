import { useAuthStore } from '@/store/authStore';

/** Stable storage namespace for the signed-in user or guest session. */
export function getAccountScopeId(): string {
  const { user, isGuest, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return 'none';
  if (isGuest || user?.id == null) return 'guest';
  return `user_${user.id}`;
}

export function scopedStorageKey(base: string, scopeId = getAccountScopeId()): string {
  return `${base}.${scopeId}`;
}
