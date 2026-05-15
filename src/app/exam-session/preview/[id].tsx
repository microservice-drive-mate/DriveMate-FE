import { ScreenWrapper } from "@/components/screen-wrapper";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { AUTH_UI } from "@/constants/auth-ui";
import { MOCK_EXAMS } from "@/data/exams.mock";
import { s, vs } from "@/utils/responsive";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

export default function ExamPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exam = MOCK_EXAMS.find((e) => e.id === id);

  return (
    <ScreenWrapper backgroundColor={AUTH_UI.colors.background} edges={["top", "bottom"]} scroll={false}>
      <ScreenHeader
        title={exam?.name ?? "Xem đề"}
        subtitle={exam ? `${exam.totalQuestions} câu • ${exam.durationMinutes} phút` : undefined}
        onBack={() => router.back()}
        bordered
      />

      {exam ? (
        <FlatList
          data={exam.questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <QuestionCard question={item} index={index} mode="preview" />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      ) : (
        <View style={styles.errorCenter} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: {
    padding: s(16),
    paddingBottom: vs(32),
    gap: s(12),
  },
  errorCenter: { flex: 1 },
});
