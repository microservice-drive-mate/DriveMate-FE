import { StepCard } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { PracticeLicense } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CommonErrorsScreen() {
  const { license } = useLocalSearchParams<{ license: string }>();
  const router = useRouter();

  const errors = useMemo(
    () => practiceService.getCommonErrors(license as PracticeLicense),
    [license],
  );

  const deductErrors = errors.filter((e) => e.type === 'deduct');
  const eliminateErrors = errors.filter((e) => e.type === 'eliminate');

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Các lỗi"
        subtitle={`Bằng ${license} – Chi tiết các loại lỗi`}
        onBack={() => router.back()}
        centered
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F3C942' }]} />
            <Text style={styles.legendText}>Trừ điểm</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AUTH_UI.colors.danger }]} />
            <Text style={styles.legendText}>Loại</Text>
          </View>
        </View>

        {/* Deduct section */}
        {deductErrors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#F3C942' }]}>
              ⚠ Lỗi trừ điểm ({deductErrors.length})
            </Text>
            {deductErrors.map((err) => (
              <StepCard key={err.id} description={err.description} type="deduct" points={err.points} />
            ))}
          </View>
        )}

        {/* Eliminate section */}
        {eliminateErrors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: AUTH_UI.colors.danger }]}>
              ⚠ Lỗi loại trực tiếp ({eliminateErrors.length})
            </Text>
            {eliminateErrors.map((err) => (
              <StepCard key={err.id} description={err.description} type="eliminate" />
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
    paddingTop: vs(4),
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
