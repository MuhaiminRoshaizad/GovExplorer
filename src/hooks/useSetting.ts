import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY_PREFIX = '@govexplorer:';

export function useSetting<T>(
  key: string,
  defaultValue: T,
): readonly [T, (next: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY_PREFIX + key)
      .then((raw) => {
        if (cancelled) return;
        if (raw !== null) {
          try { setValue(JSON.parse(raw) as T); } catch { /* keep default */ }
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [key]);

  const update = useCallback(async (next: T) => {
    setValue(next);
    await AsyncStorage.setItem(KEY_PREFIX + key, JSON.stringify(next));
  }, [key]);

  return [value, update, loaded] as const;
}
