import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Compass, Home, LineChart, Settings as SettingsIcon, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Tap, Text } from '../ui';

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
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingTop: S.sm,
        paddingBottom: insets.bottom + S.sm,
        paddingHorizontal: S.md,
        gap: S.xs,
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
  const iconScale = useSharedValue(focused ? 1.05 : 1);

  useEffect(() => {
    iconScale.value = withSpring(focused ? 1.05 : 1, Motion.spring.snappy);
  }, [focused, iconScale]);

  const wrapperStyle = useAnimatedStyle(() => ({
    backgroundColor: focused ? theme.brand.glow : 'transparent',
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Tap haptic="selection" onPress={onPress} style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            paddingVertical: S.sm,
            paddingHorizontal: S.sm,
            borderRadius: R.lg,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          },
          wrapperStyle,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Icon size={22} color={focused ? theme.brand.base : theme.textMuted} strokeWidth={focused ? 2.2 : 1.8} />
        </Animated.View>
        <Text
          variant="micro"
          style={{
            color: focused ? theme.brand.base : theme.textMuted,
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Tap>
  );
}
