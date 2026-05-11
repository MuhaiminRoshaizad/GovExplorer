import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { View, type ScrollViewProps, type ViewProps } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScrollY } from '@/components/system/ScrollContext';
import { S, TAB_BAR_CLEARANCE } from '@/theme';
import { useTheme } from '@/theme';

type Common = {
  children: ReactNode;
  edgeInset?: boolean;
  paddingHorizontal?: number;
};

export function Screen({
  children,
  edgeInset = true,
  paddingHorizontal = S.lg,
  style,
  ...rest
}: ViewProps & Common) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.bg,
          paddingTop: edgeInset ? insets.top : 0,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
          paddingHorizontal,
        },
        style,
      ]}
      {...rest}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

export function ScreenScroll({
  children,
  paddingHorizontal = S.lg,
  contentContainerStyle,
  ...rest
}: ScrollViewProps & Common) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = Math.max(0, e.contentOffset.y);
    },
  });

  useFocusEffect(
    useCallback(() => {
      scrollY.value = 0;
    }, [scrollY])
  );

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={[
        {
          paddingTop: insets.top + S.sm,
          paddingHorizontal,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        },
        contentContainerStyle,
      ]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </Animated.ScrollView>
  );
}
