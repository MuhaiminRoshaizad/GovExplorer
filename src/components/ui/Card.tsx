import { View, type ViewProps } from 'react-native';

import { R, S } from '@/theme';
import { useTheme } from '@/theme';

type Variant = 'flat' | 'elevated' | 'sunken' | 'outline';

type Props = ViewProps & {
  variant?: Variant;
  padding?: number;
  radius?: number;
};

export function Card({
  variant = 'flat',
  padding = S.lg,
  radius = R.xl,
  style,
  children,
  ...rest
}: Props) {
  const { theme, mode } = useTheme();

  const backgroundColor =
    variant === 'sunken' ? theme.surfaceSunken : variant === 'outline' ? 'transparent' : theme.surface;

  const borderColor = variant === 'outline' ? theme.border : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;

  const elevatedShadow =
    variant === 'elevated'
      ? mode === 'light'
        ? {
            shadowColor: '#1A1610',
            shadowOpacity: 0.06,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 3,
          }
        : {
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 4,
          }
      : null;

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: radius,
          padding,
          borderColor,
          borderWidth,
        },
        elevatedShadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
