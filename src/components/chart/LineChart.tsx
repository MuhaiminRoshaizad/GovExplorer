import { View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/ThemeProvider';

interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  yPrefix?: string;
}

export function LineChart({ data, labels, height = 200, yPrefix }: LineChartProps) {
  const T = useTheme();
  const points = data.map((value, i) => ({
    value,
    label: labels?.[i],
  }));
  return (
    <View>
      <GiftedLineChart
        data={points}
        height={height}
        thickness={2}
        color={T.colors.primary}
        dataPointsColor={T.colors.primary}
        dataPointsRadius={3}
        yAxisColor={T.colors.border}
        xAxisColor={T.colors.border}
        rulesColor={T.colors.border}
        rulesType="dashed"
        yAxisTextStyle={{ color: T.colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: T.colors.textMuted, fontSize: 10 }}
        yAxisLabelPrefix={yPrefix}
        curved
        areaChart
        startFillColor={T.colors.primary}
        startOpacity={0.18}
        endFillColor={T.colors.primary}
        endOpacity={0.0}
        noOfSections={4}
      />
    </View>
  );
}
