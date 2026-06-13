import { Badge } from "@/components/common/Badge";
import { OptionCard } from "@/components/exam/OptionCard";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s } from "@/utils/responsive";
import { ExamQuestion } from "@/models/exam.model";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type QuestionCardMode = "preview" | "review-correct";

interface QuestionCardProps {
  question: ExamQuestion;
  index: number;
  mode?: QuestionCardMode;
}

export function QuestionCard({ question, index, mode = "preview" }: QuestionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Badge text={`Câu ${index + 1}`} variant="accent" />
      </View>

      <Text style={styles.questionText}>{question.questionText}</Text>

      <View style={styles.optionsList}>
        {question.options.map((opt, i) => {
          const isCorrect = mode !== "preview" && i === question.correctAnswerIndex;
          return (
            <OptionCard
              key={i}
              letter={`${String.fromCharCode(65 + i)}. `}
              text={opt}
              state={isCorrect ? "correct" : "default"}
              trailingIcon={isCorrect ? "checkmark-circle" : undefined}
              trailingIconColor={AUTH_UI.colors.success}
            />
          );
        })}
      </View>

      {question.explanation && (
        <View style={styles.explanationBox}>
          <Ionicons
            name="information-circle-outline"
            size={ms(14)}
            color={AUTH_UI.colors.textMuted}
          />
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(AUTH_UI.radius.xl),
    padding: s(14),
    gap: s(10),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
  },
  questionText: {
    fontSize: ms(14),
    fontWeight: "600",
    color: AUTH_UI.colors.textPrimary,
    lineHeight: ms(22),
  },
  optionsList: {
    gap: s(8),
  },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: s(6),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: ms(AUTH_UI.radius.lg),
    padding: s(10),
  },
  explanationText: {
    flex: 1,
    fontSize: ms(12),
    fontStyle: "italic",
    color: AUTH_UI.colors.textMuted,
    lineHeight: ms(18),
  },
});
