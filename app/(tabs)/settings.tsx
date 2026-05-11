import Constants from 'expo-constants';
import { ChevronRight, Globe, Info, MapPin, Moon, Sun, SunMoon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { useI18n, type Language } from '@/i18n';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

export default function Settings() {
  const { t } = useI18n();
  const { theme, preference, setPreference } = useTheme();
  const { language, setLanguage } = useI18n();

  const themeOptions: Array<{ key: 'system' | 'light' | 'dark'; label: string; Icon: LucideIcon }> = [
    { key: 'system', label: t.settings.themeSystem, Icon: SunMoon },
    { key: 'light', label: t.settings.themeLight, Icon: Sun },
    { key: 'dark', label: t.settings.themeDark, Icon: Moon },
  ];

  return (
    <ScreenScroll>
      <ScreenEnter>
      <View style={{ marginTop: S.md }}>
        <Text variant="hero">{t.settings.title}</Text>
      </View>

      <SectionLabel label={t.settings.appearance} />
      <Card variant="flat" padding={S.xs} radius={R.xl}>
        <Stack direction="row" gap={S.xs}>
          {themeOptions.map((opt) => {
            const selected = preference === opt.key;
            return (
              <Tap
                key={opt.key}
                haptic="selection"
                onPress={() => setPreference(opt.key)}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    paddingVertical: S.md,
                    paddingHorizontal: S.sm,
                    borderRadius: R.lg,
                    backgroundColor: selected ? theme.brand.glow : 'transparent',
                    alignItems: 'center',
                    gap: S.xs,
                  }}
                >
                  <opt.Icon
                    size={18}
                    color={selected ? theme.brand.base : theme.textSoft}
                    strokeWidth={selected ? 2.2 : 1.8}
                  />
                  <Text
                    variant="caption"
                    style={{ color: selected ? theme.brand.base : theme.textSoft }}
                  >
                    {opt.label}
                  </Text>
                </View>
              </Tap>
            );
          })}
        </Stack>
      </Card>

      <SectionLabel label={t.settings.language} />
      <Card variant="flat" padding={S.xs} radius={R.xl}>
        <Stack direction="row" gap={S.xs}>
          {(['en', 'ms'] as Language[]).map((lang) => {
            const selected = language === lang;
            return (
              <Tap
                key={lang}
                haptic="selection"
                onPress={() => setLanguage(lang)}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    paddingVertical: S.md,
                    borderRadius: R.lg,
                    backgroundColor: selected ? theme.brand.glow : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="bodyBold"
                    style={{ color: selected ? theme.brand.base : theme.textSoft }}
                  >
                    {lang === 'en' ? 'English' : 'Bahasa Melayu'}
                  </Text>
                </View>
              </Tap>
            );
          })}
        </Stack>
      </Card>

      <SectionLabel label={t.settings.about} />
      <Card variant="flat" padding={0} radius={R.xl}>
        <Row Icon={MapPin} label={t.settings.location} value="Kuala Lumpur" />
        <Divider />
        <Row Icon={Globe} label="data.gov.my" value="api.data.gov.my" />
        <Divider />
        <Row Icon={Info} label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} hideChevron />
      </Card>
      </ScreenEnter>
    </ScreenScroll>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text variant="micro" tone="muted" style={{ marginTop: S.xl, marginBottom: S.sm, marginLeft: S.sm }}>
      {label}
    </Text>
  );
}

function Row({
  Icon,
  label,
  value,
  hideChevron,
}: {
  Icon: LucideIcon;
  label: string;
  value?: string;
  hideChevron?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.md,
        paddingHorizontal: S.lg,
        paddingVertical: S.md,
      }}
    >
      <Icon size={18} color={theme.textSoft} strokeWidth={1.8} />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text variant="body" tone="muted">
          {value}
        </Text>
      ) : null}
      {hideChevron ? null : <ChevronRight size={18} color={theme.textMuted} strokeWidth={1.6} />}
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: S.lg }} />;
}
