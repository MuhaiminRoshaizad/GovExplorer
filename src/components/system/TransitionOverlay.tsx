import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

const DURATION = 280;

export function TransitionOverlay() {
  const { theme, mode } = useTheme();
  const { language } = useI18n();

  const opacity = useSharedValue(0);
  const [overlayColor, setOverlayColor] = useState(theme.bg);

  const prevModeRef = useRef(mode);
  const prevLangRef = useRef(language);
  const prevBgRef = useRef(theme.bg);

  useEffect(() => {
    const changed = prevModeRef.current !== mode || prevLangRef.current !== language;

    if (changed) {
      setOverlayColor(prevBgRef.current);
      opacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: DURATION, easing: Easing.out(Easing.cubic) })
      );
    }

    prevModeRef.current = mode;
    prevLangRef.current = language;
    prevBgRef.current = theme.bg;
  }, [mode, language, theme.bg, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }, animatedStyle]}
    />
  );
}
