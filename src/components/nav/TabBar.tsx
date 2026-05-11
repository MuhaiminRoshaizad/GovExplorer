import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Compass, Home, LineChart, Settings as SettingsIcon, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Tap } from '../ui';

const ICONS: Record<string, LucideIcon> = {
  index: Home,
  explore: Compass,
  insights: LineChart,
  settings: SettingsIcon,
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const labels: Record<string, string> = {
    index: t.tabs.today,
    explore: t.tabs.explore,
    insights: t.tabs.insights,
    settings: t.tabs.settings,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.surface,
        paddingTop: S.lg,
        paddingBottom: insets.bottom + S.md,
        paddingHorizontal: S.lg,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        return (
          <TabButton
            key={route.key}
            label={labels[route.name] ?? route.name}
            Icon={Icon}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  label,
  Icon,
  focused,
  onPress,
}: {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const indicator = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    indicator.value = withSpring(focused ? 1 : 0, Motion.spring.snappy);
  }, [focused, indicator]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: indicator.value }],
    opacity: indicator.value,
  }));

  const color = focused ? theme.text : theme.textMuted;

  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={{ flex: 1, alignItems: 'center', paddingVertical: S.xs, gap: 8 }}
    >
      <Icon size={22} color={color} strokeWidth={focused ? 2 : 1.6} />
      <Animated.View
        style={[
          {
            width: 16,
            height: 2,
            borderRadius: R.pill,
            backgroundColor: theme.brand.base,
          },
          dotStyle,
        ]}
      />
    </Tap>
  );
}
