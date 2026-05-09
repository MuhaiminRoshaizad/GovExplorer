import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { SectionHead } from '@/components/ui/SectionHead';

function timeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export default function HomeScreen() {
  const T = useTheme();
  const { t } = useI18n();
  const greetingKey = `greeting.${timeOfDay()}` as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: T.spacing.xl, gap: T.spacing.xl }}>
        <View>
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.body }}>
            {t(greetingKey)} 👋
          </Text>
          <Text
            style={{
              fontFamily: T.fonts.displayHeavy,
              fontSize: T.fontSize.screenTitle,
              color: T.colors.text,
              letterSpacing: -0.6,
              marginTop: 2,
            }}
          >
            {t('home.title')}
          </Text>
        </View>

        <View>
          <SectionHead
            titleMs={t('home.featured')}
            titleEn="FEATURED"
          />
          <Link href="/dataset/fuelprice" asChild>
            <Card style={{ marginTop: T.spacing.md }}>
              <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>
                {t('cadence.weekly')} · KPDN
              </Text>
              <Text
                style={{
                  fontFamily: T.fonts.display,
                  fontSize: T.fontSize.hero,
                  color: T.colors.text,
                  marginTop: 4,
                }}
              >
                {t('fuel.title')}
              </Text>
              <Text style={{ color: T.colors.textMuted, marginTop: 4 }}>
                {t('fuel.subtitle')}
              </Text>
            </Card>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
