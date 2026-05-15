import { AUTH_UI } from '@/constants/auth-ui';
import { ms, s, vs } from '@/utils/responsive';
import { PracticeLicense } from '@/models/practice.model';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LicenseSelectorSheetProps {
  visible: boolean;
  onSelect: (license: PracticeLicense) => void;
  onClose: () => void;
}

const LICENSES: { value: PracticeLicense; label: string; description: string }[] = [
  { value: 'B1', label: 'Bằng B1', description: 'Ô tô số tự động dưới 9 chỗ' },
  { value: 'B2', label: 'Bằng B2', description: 'Ô tô số sàn dưới 9 chỗ' },
  { value: 'C', label: 'Bằng C', description: 'Xe tải, xe chuyên dụng' },
];

export function LicenseSelectorSheet({ visible, onSelect, onClose }: LicenseSelectorSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Chọn hạng bằng</Text>
        <Text style={styles.subtitle}>Chọn hạng bằng để xem nội dung phù hợp</Text>

        {LICENSES.map((license) => (
          <TouchableOpacity
            key={license.value}
            style={styles.option}
            onPress={() => onSelect(license.value)}
            activeOpacity={0.8}
          >
            <View style={styles.optionBadge}>
              <Text style={styles.optionBadgeText}>{license.value}</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{license.label}</Text>
              <Text style={styles.optionDesc}>{license.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Huỷ</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: AUTH_UI.colors.surface,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
    paddingTop: vs(12),
  },
  handle: {
    width: s(40),
    height: vs(4),
    backgroundColor: AUTH_UI.colors.border,
    borderRadius: ms(2),
    alignSelf: 'center',
    marginBottom: vs(20),
  },
  title: {
    fontSize: ms(18),
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
    marginBottom: vs(4),
  },
  subtitle: {
    fontSize: ms(13),
    color: AUTH_UI.colors.textSecondary,
    marginBottom: vs(20),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: ms(AUTH_UI.radius.lg),
    padding: s(14),
    marginBottom: vs(10),
    gap: s(14),
  },
  optionBadge: {
    width: s(44),
    height: s(44),
    borderRadius: ms(10),
    backgroundColor: AUTH_UI.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeText: {
    fontSize: ms(15),
    fontWeight: '700',
    color: AUTH_UI.colors.accentText,
  },
  optionText: {
    flex: 1,
    gap: vs(3),
  },
  optionLabel: {
    fontSize: ms(15),
    fontWeight: '600',
    color: AUTH_UI.colors.textPrimary,
  },
  optionDesc: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textSecondary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: vs(14),
    marginTop: vs(4),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: ms(AUTH_UI.radius.lg),
  },
  cancelText: {
    fontSize: ms(15),
    color: AUTH_UI.colors.textSecondary,
    fontWeight: '500',
  },
});
