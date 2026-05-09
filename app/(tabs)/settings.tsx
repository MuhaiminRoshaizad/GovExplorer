import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeControls, type ThemeOverride } from '@/theme/ThemeProvider';
import { useI18n, type LanguageOverride } from '@/i18n';
import { SectionHead } from '@/components/ui/SectionHead';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SettingsRow } from '@/components/feature/SettingsRow';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const T = useTheme();
  const { t, language, setOverride: setLang, override: langOverride } = useI18n();
  const { override: themeOverride, setOverride: setTheme } = useThemeControls();

  const themeOptions = [
    { value: 'system' as ThemeOverride, label: t('settings.themeAuto') },
    { value: 'light' as ThemeOverride, label: t('settings.themeLight') },
    { value: 'dark' as ThemeOverride, label: t('settings.themeDark') },
  ];
  const langOptions = [
    { value: 'auto' as LanguageOverride, label: t('settings.languageAuto') },
    { value: 'en' as LanguageOverride, label: t('settings.languageEn') },
    { value: 'ms' as LanguageOverride, label: t('settings.languageMs') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: T.spacing.xl, gap: T.spacing.xl }}>
        <View>
          <Text
            style={{
              fontFamily: T.fonts.displayHeavy,
              fontSize: T.fontSize.screenTitle,
              color: T.colors.text,
              letterSpacing: -0.6,
            }}
          >
            {t('tabs.settings')}
          </Text>
        </View>

        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Penampilan' : 'Appearance'}
            titleEn={t('settings.appearance').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.theme')}>
              <SegmentedControl options={themeOptions} value={themeOverride} onChange={setTheme} />
            </SettingsRow>
            <SettingsRow label={t('settings.language')}>
              <SegmentedControl options={langOptions} value={langOverride} onChange={setLang} />
            </SettingsRow>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
