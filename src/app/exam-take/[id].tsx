import { ScreenWrapper } from '@/components/screen-wrapper';
import { AUTH_UI } from '@/constants/auth-ui';
import { MOCK_EXAMS } from '@/data/exams.mock';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExamTakeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exam = MOCK_EXAMS.find((e) => e.id === id);

  return (
    <ScreenWrapper backgroundColor={AUTH_UI.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AUTH_UI.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam?.name ?? 'Làm bài thi'}
          </Text>
        </View>
      </View>

      <View style={styles.center}>
        <Ionicons name="construct-outline" size={64} color={AUTH_UI.colors.disabled} />
        <Text style={styles.title}>Chức năng đang phát triển</Text>
        {exam && <Text style={styles.subtitle}>{exam.name}</Text>}
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AUTH_UI.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: AUTH_UI.colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: AUTH_UI.radius.lg,
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
  },
});
