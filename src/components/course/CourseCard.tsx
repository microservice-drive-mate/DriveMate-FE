import { Badge } from "@/components/common/Badge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { AUTH_UI } from "@/constants/auth-ui";
import type { EnrolledCourse } from "@/models/course.model";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CourseCardProps {
  item: EnrolledCourse;
  onPress: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang học",
  COMPLETED: "Hoàn thành",
  DROPPED: "Đã hủy",
};

export function CourseCard({ item, onPress }: CourseCardProps) {
  const { enrollment, course } = item;
  const isCompleted = enrollment.status === "COMPLETED";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.badgeRow}>
        <Badge text={`Hạng ${course.licenseCategory}`} variant="accent" />
        <Badge
          text={STATUS_LABEL[enrollment.status] ?? enrollment.status}
          variant={isCompleted ? "success" : "on-tap"}
        />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {course.title}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="book-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{course.totalLessons} bài học</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="time-outline" size={ms(13)} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{course.duration}</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Tiến độ</Text>
          <Text style={styles.progressValue}>{enrollment.progress}%</Text>
        </View>
        <ProgressBar
          progress={enrollment.progress / 100}
          color={isCompleted ? AUTH_UI.colors.success : AUTH_UI.colors.accent}
        />
      </View>
    </TouchableOpacity>
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
  title: {
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
  progressBlock: {
    gap: vs(6),
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textSecondary,
  },
  progressValue: {
    fontSize: ms(12),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
  },
});
