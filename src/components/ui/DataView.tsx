import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

interface DataViewProps<T> {
  query: UseQueryResult<T>;
  renderLoading: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function DataView<T>({
  query,
  renderLoading,
  renderEmpty,
  isEmpty,
  children,
}: DataViewProps<T>) {
  const T_ = useTheme();
  const { t } = useI18n();

  if (query.isPending) return <>{renderLoading()}</>;

  if (query.isError) {
    return (
      <View style={styles.center}>
        <Text style={{
          fontSize: T_.fontSize.sectionHead,
          fontWeight: T_.fontWeight.semibold,
          color: T_.colors.danger,
        }}>
          {t('common.error')}
        </Text>
        <Text style={{
          marginTop: 6,
          fontSize: T_.fontSize.label,
          color: T_.colors.textMuted,
          textAlign: 'center',
        }}>
          {query.error instanceof Error ? query.error.message : ''}
        </Text>
        <Pressable
          onPress={() => query.refetch()}
          style={[
            styles.retry,
            { backgroundColor: T_.colors.primary, borderRadius: T_.radius.md },
          ]}
        >
          <Text style={{ color: T_.colors.onPrimary, fontWeight: T_.fontWeight.semibold }}>
            {t('common.retry')}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isEmpty?.(query.data) && renderEmpty) return <>{renderEmpty()}</>;

  return <>{children(query.data)}</>;
}

const styles = StyleSheet.create({
  center: { padding: 24, alignItems: 'center', gap: 4 },
  retry: { paddingVertical: 10, paddingHorizontal: 18, marginTop: 14 },
});
