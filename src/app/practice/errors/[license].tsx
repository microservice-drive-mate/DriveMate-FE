import { ErrorCard } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { ManeuverError } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CommonErrorsScreen() {
  const { license } = useLocalSearchParams<{ license: string }>();
  const router = useRouter();

  const [errors, setErrors] = useState<ManeuverError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!license) return;
    setIsLoading(true);
    setError(null);
    const result = await practiceService.getManeuverErrors(license);
    if (result.success) {
      setErrors(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [license]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Các lỗi"
        subtitle={`Bằng ${license} – Chi tiết các loại lỗi`}
        onBack={() => router.back()}
        centered
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={AUTH_UI.colors.accent} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Ionicons name="refresh-outline" size={ms(16)} color={AUTH_UI.colors.accent} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {errors.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu lỗi cho hạng này</Text>
          ) : (
            errors.map((err) => <ErrorCard key={err.id} error={err} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_UI.colors.background,
  },
  content: {
    paddingHorizontal: s(16),
    paddingBottom: vs(40),
    paddingTop: vs(4),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(12),
  },
  errorText: {
    color: AUTH_UI.colors.textSecondary,
    fontSize: ms(14),
    textAlign: 'center',
    paddingHorizontal: s(32),
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: ms(AUTH_UI.radius.lg),
    borderWidth: 1,
    borderColor: AUTH_UI.colors.accent,
  },
  retryText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: AUTH_UI.colors.accent,
  },
  emptyText: {
    color: AUTH_UI.colors.textMuted,
    fontSize: ms(13),
    textAlign: 'center',
    paddingVertical: vs(24),
  },
});
