import { ExerciseListItem } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { Maneuver } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CircuitListScreen() {
  const { license } = useLocalSearchParams<{ license: string }>();
  const router = useRouter();

  const [maneuvers, setManeuvers] = useState<Maneuver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!license) return;
    setIsLoading(true);
    setError(null);
    const result = await practiceService.getManeuvers(license);
    if (result.success) {
      setManeuvers(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [license]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenExercise = (id: string) => {
    router.push({
      pathname: '/practice/circuit-detail/[id]',
      params: { id, license },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={`Bằng ${license}`}
        subtitle={`${maneuvers.length} bài thi`}
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
        <FlatList
          data={maneuvers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>Bản đồ sa hình {license}</Text>
              </View>
              <Text style={styles.hint}>
                💡 Nhấn vào từng bài để xem chi tiết
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có nội dung sa hình cho hạng này</Text>
          }
          renderItem={({ item }) => (
            <ExerciseListItem
              maneuver={item}
              onPress={() => handleOpenExercise(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_UI.colors.background,
  },
  list: {
    paddingHorizontal: s(16),
    paddingBottom: vs(32),
  },
  header: {
    marginBottom: vs(16),
  },
  mapPlaceholder: {
    width: '100%',
    height: vs(200),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  mapPlaceholderText: {
    color: AUTH_UI.colors.textMuted,
    fontSize: ms(14),
  },
  hint: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textMuted,
    marginBottom: vs(4),
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
