import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { MiniSparkline } from '@/components/chart/MiniSparkline';

interface IndicatorTileProps {
  label: string;
  value: string;
  hint?: string;
  emoji?: string;
  spark?: number[];
  trend?: 'up' | 'down' | 'flat';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function IndicatorTile({
  label,
  value,
  hint,
  emoji,
  spark,
  trend = 'flat',
  onPress,
  style,
}: IndicatorTileProps) {
  const T = useTheme();
  const Wrapper: typeof View | typeof Pressable = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
          padding: T.spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>{label}</Text>
        {emoji && <Text style={{ fontSize: 16 }}>{emoji}</Text>}
      </View>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.hero,
          color: T.colors.text,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      {hint && (
        <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginTop: 2 }}>
          {hint}
        </Text>
      )}
      {spark && spark.length > 1 && (
        <View style={{ marginTop: 8 }}>
          <MiniSparkline data={spark} width={140} height={28} trend={trend} />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 168,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
