import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Application from 'expo-application';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeControls, type ThemeOverride } from '@/theme/ThemeProvider';
import { useI18n, type LanguageOverride } from '@/i18n';
import { useLocation } from '@/hooks/useLocation';
import { STATES } from '@/data/states';
import { SectionHead } from '@/components/ui/SectionHead';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SettingsRow } from '@/components/feature/SettingsRow';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const T = useTheme();
  const { t, language, setOverride: setLang, override: langOverride } = useI18n();
  const { override: themeOverride, setOverride: setTheme } = useThemeControls();
  const { state, setStateCode, detect, detecting } = useLocation();
  const [showStates, setShowStates] = useState(false);

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

        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Lokasi' : 'Location'}
            titleEn={t('settings.location').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.locationLabel')}>
              <Pressable
                onPress={() => setShowStates((v) => !v)}
                style={{
                  padding: 12,
                  borderRadius: T.radius.sm,
                  backgroundColor: T.colors.bgAlt,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: T.colors.border,
                }}
              >
                <Text style={{ color: T.colors.text }}>
                  {language === 'ms' ? state.nameMs : state.nameEn}
                </Text>
              </Pressable>
              {showStates && (
                <View style={{ gap: 4, marginTop: 8 }}>
                  {STATES.map((s) => {
                    const active = s.code === state.code;
                    return (
                      <Pressable
                        key={s.code}
                        onPress={() => {
                          setStateCode(s.code);
                          setShowStates(false);
                        }}
                        style={{
                          padding: 10,
                          borderRadius: T.radius.sm,
                          backgroundColor: active ? T.colors.primarySoft : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: active ? T.colors.primary : T.colors.text,
                            fontWeight: active ? T.fontWeight.semibold : T.fontWeight.regular,
                          }}
                        >
                          {language === 'ms' ? s.nameMs : s.nameEn}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={async () => {
                      const matched = await detect();
                      if (!matched) Alert.alert(t('onboarding.location.detectFailed'));
                      setShowStates(false);
                    }}
                    style={{
                      padding: 10,
                      marginTop: 6,
                      borderRadius: T.radius.sm,
                      backgroundColor: T.colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: T.colors.onPrimary,
                        fontWeight: T.fontWeight.semibold,
                        textAlign: 'center',
                      }}
                    >
                      {detecting ? t('onboarding.location.detecting') : t('onboarding.location.detect')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </SettingsRow>
          </Card>
        </View>

        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Mengenai' : 'About'}
            titleEn={t('settings.about').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.aboutVersion')}>
              <Text style={{ color: T.colors.textMuted, fontFamily: 'Courier' }}>
                {Application.nativeApplicationVersion ?? '0.0.0'}
              </Text>
            </SettingsRow>
            <Pressable onPress={() => Linking.openURL('https://data.gov.my')}>
              <SettingsRow label={t('settings.aboutSources')} hint="data.gov.my">
                <View />
              </SettingsRow>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://github.com/MuhaiminRoshaizad/GovExplorer')}>
              <SettingsRow label={t('settings.aboutGithub')} hint="@MuhaiminRoshaizad/GovExplorer">
                <View />
              </SettingsRow>
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
