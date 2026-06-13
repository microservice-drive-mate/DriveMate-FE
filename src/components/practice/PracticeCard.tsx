import { colors } from '@/theme';
import { ms, s, vs } from '@/utils/responsive';
import { PracticeCardType } from '@/models/practice.model';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PracticeCardProps {
  type: PracticeCardType;
  onPress: () => void;
}

const CARD_CONFIG = {
  circuit: {
    bg: colors.circuitBg,
    iconColor: colors.danger,
    iconBg: colors.circuitIconBg,
    title: 'Sa Hình Chi Tiết',
    description: 'Học chi tiết các bài thi sát hạch theo hạng bằng',
    licenses: ['B1', 'B2', 'C'] as const,
    tags: [
      { icon: 'checkmark-circle-outline' as const, label: 'Cách đúng', color: colors.success },
      { icon: 'warning-outline' as const, label: 'Trừ điểm', color: colors.accent },
      { icon: 'close-circle-outline' as const, label: 'Loại', color: colors.danger },
    ],
  },
  errors: {
    bg: colors.errorsBg,
    iconColor: colors.errorsIcon,
    iconBg: colors.errorsIconBg,
    title: 'Các Lỗi Sa Hình Chung',
    description: 'Học chi tiết các loại lỗi bị trừ điểm hoặc loại trực tiếp',
    licenses: [] as const,
    tags: [
      { icon: 'warning-outline' as const, label: 'Trừ điểm', color: colors.accent },
      { icon: 'close-circle-outline' as const, label: 'Loại', color: colors.danger },
    ],
  },
};

export function PracticeCard({ type, onPress }: PracticeCardProps) {
  const config = CARD_CONFIG[type];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: config.bg }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
          <Ionicons name="map" size={ms(24)} color={config.iconColor} />
        </View>
        <Ionicons name="chevron-forward" size={ms(18)} color={colors.textMuted} />
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>

      {config.licenses.length > 0 && (
        <View style={styles.licensesRow}>
          {config.licenses.map((l) => (
            <View key={l} style={styles.licenseBadge}>
              <Text style={styles.licenseText}>{l}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.tagsRow, { marginTop: config.licenses.length > 0 ? 8 : 12 }]}>
        {config.tags.map((tag) => (
          <View key={tag.label} style={styles.tagItem}>
            <Ionicons name={tag.icon} size={ms(13)} color={tag.color} />
            <Text style={[styles.tagText, { color: tag.color }]}>
              {tag.label}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(16),
    padding: s(16),
    marginBottom: vs(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(12),
  },
  iconBox: {
    width: s(48),
    height: s(48),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: vs(6),
  },
  description: {
    fontSize: ms(13),
    color: colors.danger,
    lineHeight: ms(18),
    marginBottom: vs(10),
  },
  licensesRow: {
    flexDirection: 'row',
    gap: s(6),
    marginBottom: 0,
  },
  licenseBadge: {
    backgroundColor: colors.licenseBadgeBg,
    borderRadius: ms(6),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  licenseText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: s(12),
    backgroundColor: colors.scrim,
    borderRadius: ms(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  tagText: {
    fontSize: ms(12),
    fontWeight: '500',
  },
});
