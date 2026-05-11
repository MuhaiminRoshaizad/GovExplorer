import { type ReactNode } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Motion } from '@/theme';

type Variant = 'fade' | 'fadeUp';

type Props = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
};

export function ScreenEnter({
  children,
  variant = 'fadeUp',
  delay = 60,
  duration = Motion.duration.base,
}: Props) {
  const entering =
    variant === 'fade'
      ? FadeIn.delay(delay).duration(duration)
      : FadeInDown.delay(delay).duration(duration);

  return (
    <Animated.View style={{ flex: 1 }} entering={entering}>
      {children}
    </Animated.View>
  );
}
