import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const T_ = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: T_.colors.bgAlt,
          borderColor: T_.colors.border,
          borderRadius: T_.radius.md,
        },
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.cell,
              {
                backgroundColor: active ? T_.colors.surface : 'transparent',
                borderRadius: T_.radius.sm,
                margin: 2,
              },
            ]}
          >
            <Text
              style={{
                color: active ? T_.colors.text : T_.colors.textMuted,
                fontWeight: active ? T_.fontWeight.semibold : T_.fontWeight.medium,
                fontSize: T_.fontSize.body - 1,
                textAlign: 'center',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, padding: 0 },
  cell: { flex: 1, paddingVertical: 9 },
});
