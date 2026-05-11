import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

export const StorageKeys = {
  onboarded: 'govexplorer.onboarded',
  streakLastOpen: 'govexplorer.streak.lastOpen',
  streakCount: 'govexplorer.streak.count',
  savedInsights: 'govexplorer.saved.insights',
  homeLocation: 'govexplorer.home.location',
} as const;
