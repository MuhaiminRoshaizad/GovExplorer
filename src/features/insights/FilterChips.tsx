import { ScrollView, View } from 'react-native';

import { Tap, Text } from '@/components/ui';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { CADENCE_FILTERS, type Cadence } from './catalogue';

type Props = {
  active: Cadence | null;
  onChange: (c: Cadence | null) => void;
};

export function FilterChips({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -S.lg, marginTop: S.lg }}
      contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm }}
    >
      <Chip label="All" active={active === null} onPress={() => onChange(null)} />
      {CADENCE_FILTERS.map((c) => (
        <Chip
          key={c}
          label={c}
          active={active === c}
          onPress={() => onChange(active === c ? null : c)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Tap haptic="selection" onPress={onPress}>
      <View
        style={{
          paddingHorizontal: S.md,
          paddingVertical: S.sm,
          borderRadius: R.pill,
          backgroundColor: active ? theme.text : 'transparent',
          borderWidth: 1,
          borderColor: active ? theme.text : theme.border,
        }}
      >
        <Text
          variant="bodyMedium"
          style={{ color: active ? theme.bg : theme.textSoft, fontSize: 13 }}
        >
          {label}
        </Text>
      </View>
    </Tap>
  );
}
