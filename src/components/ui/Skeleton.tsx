import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { R } from '@/theme';
import { useTheme } from '@/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
};

export function Skeleton({ width, height = 16, radius = R.sm }: Props) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.surfaceMuted,
        },
        style,
      ]}
    />
  );
}
