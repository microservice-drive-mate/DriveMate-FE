import { AUTH_UI } from '@/constants/auth-ui';
import { ms, s, vs } from '@/utils/responsive';
import { ManeuverError } from '@/models/practice.model';
import { StyleSheet, Text, View } from 'react-native';

// Known severities from simulation-service. Unknown values fall back to a
// neutral style so the screen never breaks on new server-side values.
const SEVERITY_META: Record<string, { label: string; bg: string; border: string; text: string }> = {
  MINOR: { label: 'Trừ điểm', bg: '#2A2000', border: '#4A3800', text: '#FDE68A' },
  MAJOR: { label: 'Lỗi nặng', bg: '#2A1500', border: '#4A2800', text: '#FDBA74' },
  CRITICAL: { label: 'Loại trực tiếp', bg: '#2A0A0A', border: '#4A1A1A', text: '#FCA5A5' },
};

const FALLBACK = { bg: AUTH_UI.colors.surface, border: AUTH_UI.colors.border, text: AUTH_UI.colors.textSecondary };

interface ErrorCardProps {
  error: ManeuverError;
}

export function ErrorCard({ error }: ErrorCardProps) {
  const meta = SEVERITY_META[error.severity];
  const style = meta ?? FALLBACK;
  const label = meta?.label ?? error.severity;

  return (
    <View style={[styles.card, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.description, { color: style.text }]}>{error.description}</Text>
      <View style={styles.footer}>
        <Text style={[styles.badge, { color: style.text, borderColor: style.border }]}>{label}</Text>
        <Text style={styles.code}>{error.code}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(10),
    borderWidth: 1,
    padding: s(14),
    marginBottom: vs(8),
    gap: vs(8),
  },
  description: {
    fontSize: ms(14),
    lineHeight: ms(20),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    fontSize: ms(11),
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: ms(6),
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    overflow: 'hidden',
  },
  code: {
    fontSize: ms(11),
    color: AUTH_UI.colors.textMuted,
  },
});
