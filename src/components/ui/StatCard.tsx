import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  emphasis?: 'default' | 'positive' | 'negative';
}

export function StatCard({ label, value, sub, emphasis = 'default' }: StatCardProps) {
  const T = useTheme();
  const subColor =
    emphasis === 'positive'
      ? T.colors.success
      : emphasis === 'negative'
        ? T.colors.danger
        : T.colors.textMuted;
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
        },
      ]}
    >
      <Text
        style={{
          fontSize: T.fontSize.monoCaps,
          color: T.colors.textMuted,
          fontWeight: T.fontWeight.medium,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: T.fonts.displayHeavy,
          fontSize: T.fontSize.hero + 2,
          color: T.colors.text,
          marginTop: 4,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      {sub && (
        <Text
          style={{
            fontSize: T.fontSize.monoCaps,
            color: subColor,
            fontWeight: T.fontWeight.medium,
            marginTop: 2,
          }}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, padding: 14, borderWidth: StyleSheet.hairlineWidth, minWidth: 0 },
});
