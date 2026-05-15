import { StepCard } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CircuitDetailScreen() {
  const { id, license } = useLocalSearchParams<{ id: string; license: string }>();
  const router = useRouter();

  const exercise = useMemo(() => practiceService.getExerciseById(id ?? ''), [id]);
  const stats = useMemo(
    () => (exercise ? practiceService.getExerciseStats(exercise) : null),
    [exercise],
  );

  if (!exercise || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title={`Bằng ${license}`}
          subtitle="Chi tiết bài thi"
          onBack={() => router.back()}
          centered
        />
        <View style={styles.center}>
          <Text style={styles.errorText}>Không tìm thấy bài thi</Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctSteps = exercise.steps.filter((s) => s.type === 'correct');
  const deductSteps = exercise.steps.filter((s) => s.type === 'deduct');
  const eliminateSteps = exercise.steps.filter((s) => s.type === 'eliminate');
  const totalSteps = exercise.steps.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={`Bằng ${license}`}
        subtitle="Chi tiết bài thi"
        onBack={() => router.back()}
        centered
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise header */}
        <View style={styles.exerciseHeader}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{exercise.number}</Text>
          </View>
          <View style={styles.exerciseTitleBlock}>
            <Text style={styles.exerciseName}>{exercise.number}. {exercise.name}</Text>
            <Text style={styles.exerciseCount}>{totalSteps} hướng dẫn</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AUTH_UI.colors.success }]} />
            <Text style={styles.legendText}>Cách đúng</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F3C942' }]} />
            <Text style={styles.legendText}>Trừ điểm</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AUTH_UI.colors.danger }]} />
            <Text style={styles.legendText}>Loại</Text>
          </View>
        </View>

        {/* Correct section */}
        {correctSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: AUTH_UI.colors.success }]}>
              ✓ Cách làm đúng ({correctSteps.length})
            </Text>
            {correctSteps.map((step) => (
              <StepCard key={step.id} description={step.description} type={step.type} />
            ))}
          </View>
        )}

        {/* Deduct section */}
        {deductSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#F3C942' }]}>
              ⚠ Lỗi trừ điểm ({deductSteps.length})
            </Text>
            {deductSteps.map((step) => (
              <StepCard key={step.id} description={step.description} type={step.type} points={step.points} />
            ))}
          </View>
        )}

        {/* Eliminate section */}
        {eliminateSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: AUTH_UI.colors.danger }]}>
              ⚠ Lỗi loại trực tiếp ({eliminateSteps.length})
            </Text>
            {eliminateSteps.map((step) => (
              <StepCard key={step.id} description={step.description} type={step.type} />
            ))}
          </View>
        )}
      </ScrollView>
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
  },
  errorText: {
    color: AUTH_UI.colors.textSecondary,
    fontSize: ms(15),
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
  legend: {
    flexDirection: 'row',
    gap: s(16),
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    marginBottom: vs(20),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  legendDot: {
    width: s(10),
    height: s(10),
    borderRadius: ms(5),
  },
  legendText: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textSecondary,
  },
  section: {
    marginBottom: vs(20),
  },
  sectionTitle: {
    fontSize: ms(15),
    fontWeight: '600',
    marginBottom: vs(10),
  },
});
