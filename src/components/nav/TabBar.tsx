import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import {
  Compass,
  House,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Tap } from '../ui';

const ICONS: Record<string, LucideIcon> = {
  index: House,
  explore: Compass,
  insights: TrendingUp,
  settings: SettingsIcon,
};

const BAR_HEIGHT = 64;
const FAB_SIZE = 60;
const FAB_LIFT = 22;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const labels: Record<string, string> = {
    index: t.tabs.today,
    explore: t.tabs.explore,
    insights: t.tabs.insights,
    settings: t.tabs.about,
  };

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number], routeIndex: number) => {
    const focused = state.index === routeIndex;
    const Icon = ICONS[route.name] ?? House;
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
  };

  const tint = mode === 'dark' ? 'dark' : 'light';
  const tintOverlay =
    mode === 'dark' ? 'rgba(20,24,33,0.55)' : 'rgba(255,255,255,0.55)';

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: FAB_LIFT + S.sm,
        paddingBottom: insets.bottom + S.sm,
        paddingHorizontal: S.lg,
      }}
    >
      <View
        style={[
          {
            height: BAR_HEIGHT,
            borderRadius: R.pill,
            overflow: 'hidden',
          },
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOpacity: mode === 'dark' ? 0.4 : 0.1,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 10 },
            },
            android: {
              elevation: 12,
              backgroundColor: tintOverlay,
            },
            default: {},
          }),
        ]}
      >
        <BlurView intensity={70} tint={tint} style={StyleSheet.absoluteFillObject} />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: tintOverlay },
          ]}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: S.sm,
          }}
        >
          {leftRoutes.map((r, i) => renderTab(r, i))}
          <View style={{ width: FAB_SIZE + S.sm }} />
          {rightRoutes.map((r, i) => renderTab(r, i + 2))}
        </View>
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: S.sm,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <ChatFab onPress={() => router.push('/chat')} />
      </View>
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
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: BAR_HEIGHT, gap: 6 }}
    >
      <Icon size={22} color={color} strokeWidth={focused ? 2.2 : 1.7} />
      <Animated.View
        style={[
          {
            width: 14,
            height: 2,
            borderRadius: R.pill,
            backgroundColor: theme.text,
          },
          dotStyle,
        ]}
      />
    </Tap>
  );
}

function ChatFab({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();
  const halo = useSharedValue(1);

  useEffect(() => {
    halo.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 1500, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
  }, [halo]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: halo.value }],
    opacity: 1.4 - halo.value,
  }));

  return (
    <View
      style={{
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: R.pill,
            backgroundColor: theme.accent.glow,
          },
          haloStyle,
        ]}
      />
      <Tap
        haptic="medium"
        scaleTo={0.92}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="AI chat"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: R.pill,
          backgroundColor: theme.accent.base,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: theme.accent.base,
              shadowOpacity: 0.4,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
            },
            android: {
              elevation: 14,
            },
            default: {},
          }),
        }}
      >
        <Sparkles size={24} color="#FFFFFF" strokeWidth={2.2} />
      </Tap>
    </View>
  );
}
