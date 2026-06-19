import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { ExamTemplate } from "@/models/examSession.model";

type ExamType = "on-tap" | "sat-hach";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ExamCardProps {
  template: ExamTemplate;
  activeType: ExamType;
  onStart: () => void;
}

export function ExamCard({ template, activeType, onStart }: ExamCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge
          text={activeType === "on-tap" ? "Ôn tập" : "Sát hạch"}
          variant={activeType === "on-tap" ? "on-tap" : "sat-hach"}
        />
        <Badge text={`Hạng ${template.licenseCategory}`} variant="accent" />
      </View>

      <Text style={styles.examName} numberOfLines={2}>
        {template.name}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="help-circle-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{template.totalQuestions} câu</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="time-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{template.durationMinutes} phút</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="checkmark-circle-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>Cần đạt {template.passingScore}/{template.totalQuestions}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button
          variant="primary"
          icon="play-outline"
          label={activeType === "on-tap" ? "Ôn tập ngay" : "Vào thi"}
          onPress={onStart}
          flex
          style={styles.primaryBtn}
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
  examName: {
    fontSize: ms(15),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
    lineHeight: ms(22),
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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
