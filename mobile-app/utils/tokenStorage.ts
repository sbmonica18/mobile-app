import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'urbanlens_access_token';
const USER_KEY = 'urbanlens_user';
/** Legacy active-guest flag — cleared on hydrate; guest sessions do not survive app restarts. */
const GUEST_KEY = 'urbanlens_guest';

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async saveToken(token: string) {
    await setItem(TOKEN_KEY, token);
  },
  async getToken() {
    return getItem(TOKEN_KEY);
  },
  async clearToken() {
    await deleteItem(TOKEN_KEY);
  },
  async saveUser(userJson: string) {
    await setItem(USER_KEY, userJson);
  },
  async getUser() {
    return getItem(USER_KEY);
  },
  async clearUser() {
    await deleteItem(USER_KEY);
  },
  async setGuest(value: boolean) {
    await setItem(GUEST_KEY, value ? '1' : '0');
  },
  async isGuest() {
    return (await getItem(GUEST_KEY)) === '1';
  },
  async clearGuest() {
    await deleteItem(GUEST_KEY);
  },
  async clearSession() {
    await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY), deleteItem(GUEST_KEY)]);
  },
  async clearAll() {
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(USER_KEY),
      deleteItem(GUEST_KEY),
    ]);
  },
};
