import { ms, s, vs } from '@/utils/responsive';
import { StepType } from '@/models/practice.model';
import { StyleSheet, Text, View } from 'react-native';

interface StepCardProps {
  description: string;
  type: StepType;
  points?: number;
}

const STEP_STYLES: Record<StepType, { bg: string; border: string; text: string }> = {
  correct: { bg: '#0F2A1A', border: '#1A4A2A', text: '#86EFAC' },
  deduct: { bg: '#2A2000', border: '#4A3800', text: '#FDE68A' },
  eliminate: { bg: '#2A0A0A', border: '#4A1A1A', text: '#FCA5A5' },
};

export function StepCard({ description, type, points }: StepCardProps) {
  const stepStyle = STEP_STYLES[type];
  const label = points != null ? `${description} (${points} điểm)` : description;

  return (
    <View style={[styles.card, { backgroundColor: stepStyle.bg, borderColor: stepStyle.border }]}>
      <Text style={[styles.text, { color: stepStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(10),
    borderWidth: 1,
    padding: s(14),
    marginBottom: vs(8),
  },
  text: {
    fontSize: ms(14),
    lineHeight: ms(20),
  },
});
