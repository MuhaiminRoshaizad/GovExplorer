import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  scaleTo?: number;
  haptic?: 'none' | 'light' | 'medium' | 'heavy' | 'selection';
};

export function Tap({ children, scaleTo = 0.97, haptic = 'light', onPressIn, onPressOut, onPress, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, Motion.spring.snappy);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, Motion.spring.bouncy);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic !== 'none') {
          const map = {
            light: Haptics.ImpactFeedbackStyle.Light,
            medium: Haptics.ImpactFeedbackStyle.Medium,
            heavy: Haptics.ImpactFeedbackStyle.Heavy,
            selection: undefined,
          } as const;
          if (haptic === 'selection') {
            void Haptics.selectionAsync();
          } else {
            void Haptics.impactAsync(map[haptic]!);
          }
        }
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
