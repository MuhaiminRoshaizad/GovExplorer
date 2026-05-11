import { type ReactNode, useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Text } from './Text';

const HIDDEN = 800;
const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxHeightRatio?: number;
};

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  maxHeightRatio = 0.85,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);

  const translateY = useSharedValue(visible ? 0 : HIDDEN);
  const backdrop = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
      backdrop.value = withTiming(1, { duration: 220 });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(
        HIDDEN,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }
      );
    }
  }, [visible, mounted, translateY, backdrop]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  if (!mounted) return null;

  const maxSheetHeight = SCREEN_HEIGHT * maxHeightRatio;

  return (
    <Modal
      transparent
      visible
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.overlay }, backdropStyle]}
      >
        <Pressable onPress={onClose} style={{ flex: 1 }} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: maxSheetHeight,
            backgroundColor: theme.surface,
            borderTopLeftRadius: R.xxl,
            borderTopRightRadius: R.xxl,
            paddingTop: S.sm,
          },
          sheetStyle,
        ]}
      >
        <View style={{ alignItems: 'center', paddingBottom: S.md }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: R.pill,
              backgroundColor: theme.border,
            }}
          />
        </View>
        {title ? (
          <Text variant="h3" style={{ paddingHorizontal: S.lg, paddingBottom: S.sm }}>
            {title}
          </Text>
        ) : null}
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + S.md }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
