import { colors, withAlpha } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type BadgeVariant = "accent" | "success" | "danger" | "warning" | "on-tap" | "sat-hach" | "critical";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { container: object; text: object }> = {
  accent: {
    container: { backgroundColor: colors.accent },
    text: { color: colors.accentText },
  },
  success: {
    container: {
      backgroundColor: withAlpha(colors.success, 0.15),
      borderWidth: 1,
      borderColor: withAlpha(colors.success, 0.3),
    },
    text: { color: colors.success },
  },
  danger: {
    container: {
      backgroundColor: withAlpha(colors.danger, 0.15),
      borderWidth: 1,
      borderColor: withAlpha(colors.danger, 0.3),
    },
    text: { color: colors.danger },
  },
  warning: {
    container: { backgroundColor: colors.warningBg },
    text: { color: colors.warning },
  },
  "on-tap": {
    container: {
      backgroundColor: colors.onTapBg,
      borderWidth: 1,
      borderColor: colors.onTapBorder,
    },
    text: { color: colors.accent },
  },
  "sat-hach": {
    container: {
      backgroundColor: colors.satHachBg,
      borderWidth: 1,
      borderColor: colors.satHachBorder,
    },
    text: { color: colors.satHachText },
  },
  critical: {
    container: {
      backgroundColor: withAlpha(colors.danger, 0.15),
      borderWidth: 1,
      borderColor: withAlpha(colors.danger, 0.3),
    },
    text: { color: colors.danger },
  },
};

export function Badge({ text, variant = "accent", style }: BadgeProps) {
  const variantStyle = variantStyles[variant];
  return (
    <View style={[styles.base, variantStyle.container, style]}>
      <Text style={[styles.text, variantStyle.text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(20),
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
    alignSelf: "flex-start",
  },
  text: {
    fontSize: ms(11),
    fontWeight: "600",
  },
});
