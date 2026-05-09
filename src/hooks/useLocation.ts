import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { useSetting } from './useSetting';
import { DEFAULT_STATE_CODE, STATES, type MalaysianState } from '@/data/states';

export interface LocationContextValue {
  state: MalaysianState;
  setStateCode: (code: string) => Promise<void>;
  detect: () => Promise<MalaysianState | null>;
  detecting: boolean;
  detectError: string | null;
  loaded: boolean;
}

export function useLocation(): LocationContextValue {
  const [code, setCode, loaded] = useSetting<string>('location.state', DEFAULT_STATE_CODE);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const state = STATES.find((s) => s.code === code) ?? STATES.find((s) => s.code === DEFAULT_STATE_CODE)!;

  const setStateCode = useCallback(
    async (next: string) => {
      if (STATES.some((s) => s.code === next)) {
        await setCode(next);
      }
    },
    [setCode],
  );

  const detect = useCallback(async (): Promise<MalaysianState | null> => {
    setDetecting(true);
    setDetectError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDetectError('permission denied');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const region = places[0]?.region ?? '';
      const matched = STATES.find(
        (s) =>
          region.toLowerCase().includes(s.nameEn.toLowerCase()) ||
          region.toLowerCase().includes(s.nameMs.toLowerCase()) ||
          region.toLowerCase().includes(s.code.toLowerCase()),
      );
      if (matched) {
        await setCode(matched.code);
        return matched;
      }
      setDetectError('no match');
      return null;
    } catch (err) {
      setDetectError(err instanceof Error ? err.message : 'unknown');
      return null;
    } finally {
      setDetecting(false);
    }
  }, [setCode]);

  return { state, setStateCode, detect, detecting, detectError, loaded };
}
