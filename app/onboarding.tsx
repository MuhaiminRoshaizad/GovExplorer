import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, type LanguageOverride } from '@/i18n';
import { useThemeControls, type ThemeOverride } from '@/theme/ThemeProvider';
import { useOnboarded } from '@/hooks/useOnboarded';
import { useLocation } from '@/hooks/useLocation';
import { STATES } from '@/data/states';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function OnboardingScreen() {
  const T = useTheme();
  const { t, language, override: langOverride, setOverride: setLang } = useI18n();
  const { override: themeOverride, setOverride: setTheme } = useThemeControls();
  const { setCompleted } = useOnboarded();
  const { state, setStateCode, detect, detecting } = useLocation();
  const [step, setStep] = useState(0);

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

  async function handleDetect() {
    const matched = await detect();
    if (!matched) Alert.alert(t('onboarding.location.detectFailed'));
  }

  async function handleDone() {
    try {
      await setCompleted(true);
      router.replace('/');
    } catch (err) {
      console.warn('[onboarding] failed to persist completion', err);
    }
  }

  const isLast = step === 2;
  const next = () => {
    if (isLast) {
      void handleDone();
    } else {
      setStep((s) => s + 1);
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.xl }}>
        {step === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', gap: T.spacing.md }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.screenTitle,
                color: T.colors.text,
                letterSpacing: -0.6,
              }}
            >
              {t('onboarding.intro.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.body, lineHeight: 22 }}>
              {t('onboarding.intro.body')}
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={{ flex: 1, gap: T.spacing.lg }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.hero,
                color: T.colors.text,
              }}
            >
              {t('onboarding.appearance.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted }}>
              {t('onboarding.appearance.body')}
            </Text>
            <View style={{ gap: T.spacing.sm }}>
              <Text style={{ color: T.colors.text, fontWeight: T.fontWeight.semibold }}>
                {t('onboarding.appearance.themeLabel')}
              </Text>
              <SegmentedControl options={themeOptions} value={themeOverride} onChange={setTheme} />
            </View>
            <View style={{ gap: T.spacing.sm }}>
              <Text style={{ color: T.colors.text, fontWeight: T.fontWeight.semibold }}>
                {t('onboarding.appearance.languageLabel')}
              </Text>
              <SegmentedControl options={langOptions} value={langOverride} onChange={setLang} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ flex: 1, gap: T.spacing.lg }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.hero,
                color: T.colors.text,
              }}
            >
              {t('onboarding.location.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted }}>
              {t('onboarding.location.body')}
            </Text>
            <Pressable
              onPress={handleDetect}
              style={[
                styles.detectBtn,
                {
                  backgroundColor: T.colors.primarySoft,
                  borderRadius: T.radius.md,
                },
              ]}
            >
              <Text style={{ color: T.colors.primary, fontWeight: T.fontWeight.semibold }}>
                {detecting ? t('onboarding.location.detecting') : t('onboarding.location.detect')}
              </Text>
            </Pressable>
            <FlatList
              data={STATES}
              keyExtractor={(s) => s.code}
              renderItem={({ item }) => {
                const active = item.code === state.code;
                return (
                  <Pressable
                    onPress={() => setStateCode(item.code)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: T.spacing.md,
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
                      {language === 'ms' ? item.nameMs : item.nameEn}
                    </Text>
                  </Pressable>
                );
              }}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <View style={styles.footer}>
          {step > 0 && (
            <Pressable onPress={back} style={styles.footerBtn}>
              <Text style={{ color: T.colors.textMuted, fontWeight: T.fontWeight.medium }}>
                {t('onboarding.back')}
              </Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={next}
            style={[
              styles.nextBtn,
              { backgroundColor: T.colors.primary, borderRadius: T.radius.md },
            ]}
          >
            <Text style={{ color: T.colors.onPrimary, fontWeight: T.fontWeight.semibold }}>
              {isLast ? t('onboarding.done') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detectBtn: { paddingVertical: 12, alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  nextBtn: { paddingVertical: 12, paddingHorizontal: 24 },
});
