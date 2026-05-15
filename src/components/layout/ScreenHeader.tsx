import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  centered?: boolean;
  bordered?: boolean;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  centered = false,
  bordered = false,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, bordered && styles.bordered, style]}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={ms(20)} color={AUTH_UI.colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        centered && <View style={styles.backBtn} />
      )}

      <View style={[styles.textBlock, centered && styles.textCentered]}>
        <Text
          style={[styles.title, centered && styles.titleCentered]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {rightIcon ? (
        <TouchableOpacity style={styles.backBtn} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={ms(20)} color={AUTH_UI.colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        centered && onBack && <View style={styles.backBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    gap: s(12),
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: AUTH_UI.colors.border,
  },
  backBtn: {
    width: s(36),
    height: s(36),
    borderRadius: ms(18),
    backgroundColor: AUTH_UI.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: vs(2),
  },
  textCentered: {
    alignItems: "center",
  },
  title: {
    fontSize: ms(17),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
  },
  titleCentered: {
    textAlign: "center",
    fontSize: ms(18),
  },
  subtitle: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textSecondary,
  },
});
