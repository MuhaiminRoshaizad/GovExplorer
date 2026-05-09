import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  padded?: boolean;
}

export function Card({ padded = true, style, children, ...rest }: CardProps) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
          padding: padded ? T.spacing.lg : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth },
});
