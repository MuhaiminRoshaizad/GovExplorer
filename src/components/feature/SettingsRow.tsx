import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SettingsRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function SettingsRow({ label, hint, children }: SettingsRowProps) {
  const T = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ marginBottom: 6 }}>
        <Text
          style={{
            color: T.colors.text,
            fontWeight: T.fontWeight.semibold,
            fontSize: T.fontSize.body,
          }}
        >
          {label}
        </Text>
        {hint && (
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginTop: 2 }}>
            {hint}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12 },
});
