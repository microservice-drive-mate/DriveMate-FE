import { ScreenWrapper } from '@/components/screen-wrapper';
import { AUTH_UI } from '@/constants/auth-ui';
import { MOCK_EXAMS } from '@/data/exams.mock';
import { ExamQuestion } from '@/models/exam.model';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExamPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exam = MOCK_EXAMS.find((e) => e.id === id);

  if (!exam) {
    return (
      <ScreenWrapper backgroundColor={AUTH_UI.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={AUTH_UI.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorCenter}>
          <Ionicons name="alert-circle-outline" size={48} color={AUTH_UI.colors.danger} />
          <Text style={styles.errorText}>Không tìm thấy đề thi</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={AUTH_UI.colors.background} edges={['top', 'bottom']} scroll={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AUTH_UI.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam.name}
          </Text>
          <Text style={styles.headerSub}>
            {exam.totalQuestions} câu • {exam.durationMinutes} phút
          </Text>
        </View>
      </View>

      <FlatList
        data={exam.questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <QuestionCard question={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </ScreenWrapper>
  );
}

function QuestionCard({ question, index }: { question: ExamQuestion; index: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>Câu {index + 1}</Text>
        </View>
        {question.isCritical && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>⚡ Điểm liệt</Text>
          </View>
        )}
      </View>

      <Text style={styles.questionText}>{question.questionText}</Text>

      <View style={styles.optionsList}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctAnswerIndex;
          return (
            <View
              key={i}
              style={[
                styles.option,
                isCorrect ? styles.optionCorrect : styles.optionDefault,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isCorrect ? styles.optionTextCorrect : styles.optionTextDefault,
                ]}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </Text>
              {isCorrect && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={AUTH_UI.colors.success}
                  style={styles.checkIcon}
                />
              )}
            </View>
          );
        })}
      </View>

      {question.explanation && (
        <View style={styles.explanationBox}>
          <Ionicons name="information-circle-outline" size={14} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: AUTH_UI.colors.border,
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
    fontSize: 15,
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: AUTH_UI.colors.textSecondary,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: AUTH_UI.radius.xl,
    padding: 14,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionBadge: {
    backgroundColor: AUTH_UI.colors.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  questionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AUTH_UI.colors.accentText,
  },
  criticalBadge: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  criticalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: AUTH_UI.colors.danger,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
    lineHeight: 22,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: AUTH_UI.radius.lg,
    padding: 10,
  },
  optionDefault: {
    borderColor: AUTH_UI.colors.border,
    backgroundColor: 'transparent',
  },
  optionCorrect: {
    borderColor: AUTH_UI.colors.success,
    backgroundColor: 'rgba(83,209,141,0.1)',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  optionTextDefault: {
    color: AUTH_UI.colors.textSecondary,
  },
  optionTextCorrect: {
    color: AUTH_UI.colors.success,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 6,
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: AUTH_UI.radius.lg,
    padding: 10,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    color: AUTH_UI.colors.textMuted,
    lineHeight: 18,
  },
  errorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: AUTH_UI.colors.textSecondary,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: AUTH_UI.radius.lg,
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
  },
});
