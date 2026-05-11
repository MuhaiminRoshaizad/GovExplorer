import Constants from 'expo-constants';
import {
  Check,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  Moon,
  ScrollText,
  Shield,
  Sparkles,
  Sun,
  SunMoon,
  TrendingUp,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { BottomSheet, Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { useStatePref } from '@/data/StateContext';
import { STATES } from '@/data/states';
import { useI18n, type Language } from '@/i18n';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

type ThemePref = 'system' | 'light' | 'dark';

export default function AboutScreen() {
  const { t, language, setLanguage } = useI18n();
  const { theme, preference, setPreference } = useTheme();

  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [stateSheetOpen, setStateSheetOpen] = useState(false);
  const { code: stateCode, state: currentState, setCode: setStateCode } = useStatePref();

  const themeLabels: Record<ThemePref, string> = {
    system: t.settings.themeSystem,
    light: t.settings.themeLight,
    dark: t.settings.themeDark,
  };

  const themeIcons: Record<ThemePref, LucideIcon> = {
    system: SunMoon,
    light: Sun,
    dark: Moon,
  };

  const langLabels: Record<Language, string> = {
    en: 'English',
    ms: 'Bahasa Melayu',
  };

  const features: Array<{ Icon: LucideIcon; label: string; tone: string }> = [
    { Icon: Sparkles, label: t.about.features.today, tone: theme.accent.base },
    { Icon: Compass, label: t.about.features.explore, tone: theme.chart.teal },
    { Icon: TrendingUp, label: t.about.features.insights, tone: theme.gold.base },
    { Icon: Sparkles, label: t.about.features.chat, tone: theme.accent.base },
  ];

  return (
    <ScreenScroll>
      <ScreenEnter>
        <View style={{ alignItems: 'center', marginTop: S.xl }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: R.xxl,
              backgroundColor: theme.brand.glow,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: S.lg,
            }}
          >
            <Compass size={42} color={theme.brand.base} strokeWidth={1.6} />
          </View>
          <Text variant="hero" style={{ textAlign: 'center' }}>
            GovExplorer
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: S.xs }}>
            v{VERSION}
          </Text>
          <Text
            variant="bodyLg"
            tone="soft"
            style={{ textAlign: 'center', marginTop: S.lg, maxWidth: 320 }}
          >
            {t.about.tagline}
          </Text>
          <Text
            variant="body"
            tone="muted"
            style={{ textAlign: 'center', marginTop: S.md, maxWidth: 320, lineHeight: 20 }}
          >
            {t.about.description}
          </Text>
        </View>

        <Stack gap={S.md} style={{ marginTop: S.xxxl }}>
          {features.map((f, i) => (
            <FeatureRow key={i} Icon={f.Icon} label={f.label} tone={f.tone} />
          ))}
        </Stack>

        <SectionLabel label={t.about.sections.preferences} />
        <Card variant="flat" padding={0} radius={R.xl}>
          <SettingRow
            Icon={themeIcons[preference as ThemePref] ?? SunMoon}
            label={t.settings.appearance}
            value={themeLabels[preference as ThemePref]}
            onPress={() => setThemeSheetOpen(true)}
          />
          <Divider />
          <SettingRow
            Icon={Globe}
            label={t.settings.language}
            value={langLabels[language]}
            onPress={() => setLangSheetOpen(true)}
          />
          <Divider />
          <SettingRow
            Icon={MapPin}
            label={t.settings.location}
            value={currentState.name}
            onPress={() => setStateSheetOpen(true)}
          />
        </Card>

        <SectionLabel label={t.about.sections.info} />
        <Card variant="flat" padding={0} radius={R.xl}>
          <InfoRow Icon={Database} label={t.about.rows.dataSource} value={t.about.rows.dataSourceValue} />
          <Divider />
          <InfoRow Icon={Lock} label={t.about.rows.privacy} value={t.about.rows.privacyValue} />
          <Divider />
          <LinkRow
            Icon={Globe}
            label={t.about.rows.source}
            value={t.about.rows.sourceValue}
            href="https://github.com/MuhaiminRoshaizad/GovExplorer"
          />
        </Card>

        <SectionLabel label={t.about.sections.legal} />
        <Card variant="flat" padding={0} radius={R.xl}>
          <LinkRow Icon={ScrollText} label={t.about.rows.terms} />
          <Divider />
          <LinkRow Icon={Shield} label={t.about.rows.privacyPolicy} />
        </Card>

        <Text
          variant="caption"
          tone="muted"
          style={{ textAlign: 'center', marginTop: S.xxxl }}
        >
          {t.about.madeBy}
        </Text>
      </ScreenEnter>

      <BottomSheet
        visible={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
        title={t.settings.appearance}
      >
        {(['system', 'light', 'dark'] as ThemePref[]).map((key) => (
          <OptionRow
            key={key}
            Icon={themeIcons[key]}
            label={themeLabels[key]}
            selected={preference === key}
            onPress={() => {
              setPreference(key);
              setThemeSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        visible={langSheetOpen}
        onClose={() => setLangSheetOpen(false)}
        title={t.settings.language}
      >
        {(['en', 'ms'] as Language[]).map((key) => (
          <OptionRow
            key={key}
            label={langLabels[key]}
            selected={language === key}
            onPress={() => {
              setLanguage(key);
              setLangSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        visible={stateSheetOpen}
        onClose={() => setStateSheetOpen(false)}
        title={t.settings.location}
      >
        {STATES.map((s) => (
          <OptionRow
            key={s.code}
            label={s.name}
            selected={stateCode === s.code}
            onPress={() => {
              setStateCode(s.code);
              setStateSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </ScreenScroll>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text variant="micro" tone="muted" style={{ marginTop: S.xxl, marginBottom: S.sm, marginLeft: S.sm }}>
      {label}
    </Text>
  );
}

function FeatureRow({ Icon, label, tone }: { Icon: LucideIcon; label: string; tone: string }) {
  return (
    <Stack direction="row" align="center" gap={S.md}>
      <Icon size={20} color={tone} strokeWidth={1.8} />
      <Text variant="body" tone="soft" style={{ flex: 1 }}>
        {label}
      </Text>
    </Stack>
  );
}

function SettingRow({
  Icon,
  label,
  value,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Tap haptic="light" onPress={onPress}>
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
        <Text variant="body" tone="muted">
          {value}
        </Text>
        <ChevronRight size={16} color={theme.textMuted} strokeWidth={1.6} />
      </View>
    </Tap>
  );
}

function OptionRow({
  Icon,
  label,
  selected,
  onPress,
}: {
  Icon?: LucideIcon;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Tap haptic="selection" onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: S.md,
          paddingHorizontal: S.lg,
          paddingVertical: S.md,
          backgroundColor: selected ? theme.brand.glow : 'transparent',
        }}
      >
        {Icon ? (
          <Icon
            size={18}
            color={selected ? theme.brand.base : theme.textSoft}
            strokeWidth={selected ? 2.2 : 1.8}
          />
        ) : (
          <View style={{ width: 18 }} />
        )}
        <Text
          variant={selected ? 'bodyBold' : 'body'}
          style={{ flex: 1, color: selected ? theme.brand.base : theme.text }}
        >
          {label}
        </Text>
        {selected ? <Check size={18} color={theme.brand.base} strokeWidth={2.4} /> : null}
      </View>
    </Tap>
  );
}

function InfoRow({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
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
      <Text variant="body" tone="muted">
        {value}
      </Text>
    </View>
  );
}

function LinkRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: LucideIcon;
  label: string;
  value?: string;
  href?: string;
}) {
  const { theme } = useTheme();
  const enabled = !!href;

  return (
    <Tap
      haptic={enabled ? 'light' : 'none'}
      onPress={() => {
        if (href) Linking.openURL(href).catch(() => {});
      }}
      style={{ opacity: enabled ? 1 : 0.6 }}
    >
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
        {enabled ? (
          <ExternalLink size={16} color={theme.textMuted} strokeWidth={1.6} />
        ) : (
          <ChevronRight size={18} color={theme.textMuted} strokeWidth={1.6} />
        )}
      </View>
    </Tap>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: S.lg }} />;
}
