import { AUTH_UI } from '@/constants/auth-ui';
import { ms, s, vs } from '@/utils/responsive';
import { ManeuverCheckpoint } from '@/models/practice.model';
import { StyleSheet, Text, View } from 'react-native';

interface CheckpointCardProps {
  checkpoint: ManeuverCheckpoint;
}

export function CheckpointCard({ checkpoint }: CheckpointCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{checkpoint.displayOrder}</Text>
        </View>
        <Text style={styles.title}>{checkpoint.title}</Text>
      </View>
      <Text style={styles.instruction}>{checkpoint.instruction}</Text>
      {!!checkpoint.penalty && (
        <View style={styles.penaltyRow}>
          <Text style={styles.penaltyLabel}>Trừ điểm</Text>
          <Text style={styles.penaltyText}>{checkpoint.penalty}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(10),
    padding: s(14),
    marginBottom: vs(10),
    gap: vs(8),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  orderBadge: {
    width: s(26),
    height: s(26),
    borderRadius: ms(7),
    backgroundColor: '#1A3A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: AUTH_UI.colors.success,
  },
  title: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
  },
  instruction: {
    fontSize: ms(14),
    lineHeight: ms(20),
    color: AUTH_UI.colors.textSecondary,
  },
  penaltyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
    backgroundColor: '#2A2000',
    borderRadius: ms(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
  },
  penaltyLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#FDE68A',
    backgroundColor: '#4A3800',
    borderRadius: ms(6),
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    overflow: 'hidden',
  },
  penaltyText: {
    flex: 1,
    fontSize: ms(13),
    lineHeight: ms(19),
    color: '#FDE68A',
  },
});
