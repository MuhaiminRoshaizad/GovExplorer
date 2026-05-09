import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SectionHeadProps {
  titleMs: string;
  titleEn: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ titleMs, titleEn, action, onAction }: SectionHeadProps) {
  const T = useTheme();
  return (
    <View style={styles.row}>
      <View>
        <Text
          style={{
            fontFamily: T.fonts.display,
            fontSize: T.fontSize.sectionHead,
            color: T.colors.text,
            letterSpacing: -0.3,
          }}
        >
          {titleMs}
        </Text>
        <Text
          style={{
            fontSize: T.fontSize.monoCaps,
            color: T.colors.textMuted,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {titleEn}
        </Text>
      </View>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text
            style={{
              fontSize: T.fontSize.body - 1,
              color: T.colors.primary,
              fontWeight: T.fontWeight.semibold,
            }}
          >
            {action} ›
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
});
