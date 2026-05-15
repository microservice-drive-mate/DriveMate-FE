import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Exam, ExamType } from "@/models/exam.model";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ExamCardProps {
  exam: Exam;
  activeType: ExamType;
  onStart: () => void;
  onPreview: () => void;
}

function passRateColor(rate: number): string {
  if (rate >= 90) return AUTH_UI.colors.success;
  if (rate >= 75) return AUTH_UI.colors.accent;
  return AUTH_UI.colors.danger;
}

export function ExamCard({ exam, activeType, onStart, onPreview }: ExamCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge
          text={activeType === "on-tap" ? "Ôn tập" : "Sát hạch"}
          variant={activeType === "on-tap" ? "on-tap" : "sat-hach"}
        />
        {exam.hasCriticalQuestions && (
          <Badge text="⚡ Có câu liệt" variant="critical" />
        )}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.examName} numberOfLines={2}>
          {exam.name}
        </Text>
        <View style={styles.passRateBox}>
          <Text style={[styles.passRate, { color: passRateColor(exam.passRate) }]}>
            {exam.passRate}%
          </Text>
          <Text style={styles.passRateLabel}>tỷ lệ đạt</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="help-circle-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.totalQuestions} câu</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="time-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.durationMinutes} phút</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="people-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.attemptCount.toLocaleString()} lượt</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button
          variant="primary"
          label={activeType === "on-tap" ? "🚀 Ôn tập ngay" : "🚀 Vào thi"}
          onPress={onStart}
          flex
          style={styles.primaryBtn}
        />
        <Button
          variant="secondary"
          label="Xem đề"
          icon="eye-outline"
          onPress={onPreview}
          flex
          style={styles.secondaryBtn}
        />
      </View>
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
  badgeRow: {
    flexDirection: "row",
    gap: s(6),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: s(8),
  },
  examName: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
    lineHeight: ms(22),
  },
  passRateBox: {
    alignItems: "flex-end",
  },
  passRate: {
    fontSize: ms(18),
    fontWeight: "800",
  },
  passRateLabel: {
    fontSize: ms(10),
    color: AUTH_UI.colors.textMuted,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: s(12),
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(4),
  },
  statText: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textMuted,
  },
  buttonRow: {
    flexDirection: "row",
    gap: s(8),
  },
  primaryBtn: {
    height: vs(42),
  },
  secondaryBtn: {
    height: vs(42),
  },
});
