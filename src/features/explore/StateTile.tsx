import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Skeleton, Tap, Text } from '@/components/ui';
import type { MalaysiaState } from '@/data/states';
import { formatCompact } from '@/lib/format';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

type Props = {
  state: MalaysiaState;
  population?: number;
  isUser: boolean;
  isLoading: boolean;
};

export function StateTile({ state, population, isUser, isLoading }: Props) {
  const { theme } = useTheme();
  return (
    <Tap
      haptic="light"
      onPress={() => router.push(`/state/${state.code}` as never)}
      accessibilityLabel={state.name}
      style={{ flex: 1 }}
    >
      <Card
        variant="flat"
        padding={S.md}
        radius={R.xl}
        style={{
          aspectRatio: 1,
          backgroundColor: isUser ? theme.accent.glow : theme.surface,
          borderWidth: isUser ? 1 : 0,
          borderColor: isUser ? theme.accent.base : 'transparent',
        }}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <Text
              variant="hero"
              style={{
                fontSize: 22,
                lineHeight: 26,
                color: isUser ? theme.accent.base : theme.text,
              }}
            >
              {state.code.toUpperCase()}
            </Text>
            <Text
              variant="caption"
              tone={isUser ? 'accent' : 'soft'}
              numberOfLines={1}
              style={{ marginTop: 2 }}
            >
              {state.name}
            </Text>
          </View>
          {isLoading ? (
            <Skeleton width={56} height={14} />
          ) : population != null ? (
            <Text variant="bodyBold" tone={isUser ? 'accent' : 'default'}>
              {formatCompact(population * 1000)}
            </Text>
          ) : (
            <Text variant="caption" tone="muted">
              —
            </Text>
          )}
        </View>
      </Card>
    </Tap>
  );
}
