import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/theme';
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
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={[
        {
          paddingTop: insets.top + S.sm,
          paddingHorizontal,
          paddingBottom: insets.bottom + S.huge,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ScrollView>
  );
}
