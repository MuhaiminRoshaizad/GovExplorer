import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function SavedScreen() {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.sm }}>
        <Text
          style={{
            fontFamily: T.fonts.displayHeavy,
            fontSize: T.fontSize.screenTitle,
            color: T.colors.text,
            letterSpacing: -0.6,
          }}
        >
          {t('tabs.saved')}
        </Text>
        <Text style={{ color: T.colors.textMuted }}>
          Coming in Plan 03 — favourited datasets.
        </Text>
      </View>
    </SafeAreaView>
  );
}
