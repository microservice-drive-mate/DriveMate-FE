import { AUTH_UI } from '@/constants/auth-ui';
import { ms, s, vs } from '@/utils/responsive';
import { CircuitExercise } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExerciseListItemProps {
  exercise: CircuitExercise;
  onPress: () => void;
}

export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps) {
  const { correctCount, deductCount, eliminateCount } = practiceService.getExerciseStats(exercise);

  const subtitle = [
    correctCount > 0 ? `${correctCount} cách đúng` : null,
    deductCount > 0 ? `${deductCount} lỗi trừ điểm` : null,
    eliminateCount > 0 ? `${eliminateCount} lỗi loại` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{exercise.number}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name}>{exercise.number}. {exercise.name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={ms(16)} color={AUTH_UI.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(AUTH_UI.radius.lg),
    padding: s(14),
    gap: s(12),
    marginBottom: vs(8),
  },
  badge: {
    width: s(36),
    height: s(36),
    borderRadius: ms(8),
    backgroundColor: '#1A3A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: ms(15),
    fontWeight: '700',
    color: AUTH_UI.colors.success,
  },
  textBlock: {
    flex: 1,
    gap: vs(3),
  },
  name: {
    fontSize: ms(15),
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
  },
  subtitle: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textSecondary,
  },
});
