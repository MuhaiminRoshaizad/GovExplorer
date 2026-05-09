import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  const T = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          borderColor: active ? T.colors.primary : T.colors.border,
          backgroundColor: active ? T.colors.primary : T.colors.surface,
        },
      ]}
    >
      <Text
        style={{
          color: active ? '#FFFFFF' : T.colors.text,
          fontSize: T.fontSize.body - 1,
          fontWeight: T.fontWeight.medium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
