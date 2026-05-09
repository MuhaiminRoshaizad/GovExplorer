import { View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/ThemeProvider';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: 'up' | 'down' | 'flat';
}

export function MiniSparkline({
  data,
  width = 64,
  height = 24,
  trend = 'flat',
}: MiniSparklineProps) {
  const T = useTheme();
  const color =
    trend === 'up'
      ? T.colors.danger
      : trend === 'down'
        ? T.colors.success
        : T.colors.textMuted;
  const points = data.map((value) => ({ value }));
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <GiftedLineChart
        data={points}
        width={width}
        height={height}
        hideAxesAndRules
        hideDataPoints
        thickness={1.5}
        color={color}
        initialSpacing={0}
        endSpacing={0}
        spacing={width / Math.max(data.length - 1, 1)}
        adjustToWidth
        disableScroll
        curved
      />
    </View>
  );
}
