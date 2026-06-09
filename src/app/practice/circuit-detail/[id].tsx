import { CheckpointCard } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { Maneuver } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CircuitDetailScreen() {
  const { id, license } = useLocalSearchParams<{ id: string; license: string }>();
  const router = useRouter();

  const [maneuver, setManeuver] = useState<Maneuver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    const result = await practiceService.getManeuverById(id);
    if (result.success) {
      setManeuver(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const checkpoints = [...(maneuver?.checkpoints ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={`Bằng ${license}`}
        subtitle="Chi tiết bài thi"
        onBack={() => router.back()}
        centered
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={AUTH_UI.colors.accent} size="large" />
        </View>
      ) : error || !maneuver ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Không tìm thấy bài thi'}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Ionicons name="refresh-outline" size={ms(16)} color={AUTH_UI.colors.accent} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Maneuver header */}
          <View style={styles.exerciseHeader}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{maneuver.displayOrder}</Text>
            </View>
            <View style={styles.exerciseTitleBlock}>
              <Text style={styles.exerciseName}>{maneuver.displayOrder}. {maneuver.title}</Text>
              <Text style={styles.exerciseCount}>{checkpoints.length} bước thực hiện</Text>
            </View>
          </View>

          {!!maneuver.description && (
            <Text style={styles.description}>{maneuver.description}</Text>
          )}

          {checkpoints.map((checkpoint) => (
            <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
          ))}
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(12),
  },
  errorText: {
    color: AUTH_UI.colors.textSecondary,
    fontSize: ms(15),
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
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    marginBottom: vs(16),
    marginTop: vs(4),
  },
  numberBadge: {
    width: s(44),
    height: s(44),
    borderRadius: ms(10),
    backgroundColor: '#1A3A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: ms(18),
    fontWeight: '700',
    color: AUTH_UI.colors.success,
  },
  exerciseTitleBlock: {
    flex: 1,
    gap: vs(3),
  },
  exerciseName: {
    fontSize: ms(18),
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
  },
  exerciseCount: {
    fontSize: ms(13),
    color: AUTH_UI.colors.textSecondary,
  },
  description: {
    fontSize: ms(14),
    lineHeight: ms(20),
    color: AUTH_UI.colors.textSecondary,
    marginBottom: vs(16),
  },
});
