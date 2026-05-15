import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s } from "@/utils/responsive";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface StatBoxProps {
  value: string | number;
  label: string;
  bg?: string;
  valueColor?: string;
  labelColor?: string;
  style?: ViewStyle;
}

export function StatBox({ value, label, bg, valueColor, labelColor, style }: StatBoxProps) {
  return (
    <View
      style={[
        styles.box,
        bg ? { backgroundColor: bg } : null,
        style,
      ]}>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={[styles.label, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: ms(AUTH_UI.radius.xl),
    padding: s(12),
    alignItems: "center",
    gap: s(4),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
  },
  value: {
    fontSize: ms(18),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
  },
  label: {
    fontSize: ms(11),
    fontWeight: "500",
    color: AUTH_UI.colors.textSecondary,
  },
});
