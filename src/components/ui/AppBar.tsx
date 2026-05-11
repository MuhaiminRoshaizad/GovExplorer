import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Stack } from './Stack';
import { Tap } from './Tap';
import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: string;
  variant?: 'back' | 'close';
  right?: ReactNode;
  onLeftPress?: () => void;
};

export function AppBar({ title, subtitle, variant = 'back', right, onLeftPress }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const Icon = variant === 'close' ? X : ChevronLeft;

  const handleLeft = onLeftPress ?? (() => router.back());

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: S.lg,
        backgroundColor: theme.bg,
      }}
    >
      <Stack
        direction="row"
        align="center"
        style={{ height: 56, gap: S.md }}
      >
        <Tap haptic="selection" onPress={handleLeft}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: R.pill,
              backgroundColor: theme.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} color={theme.text} strokeWidth={2} />
          </View>
        </Tap>
        <View style={{ flex: 1 }}>
          {subtitle ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {title ? (
            <Text variant="bodyBold" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
        {right ?? <View style={{ width: 36 }} />}
      </Stack>
    </View>
  );
}
