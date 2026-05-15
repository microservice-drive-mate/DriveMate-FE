import { AUTH_UI } from "@/constants/auth-ui";
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
    container: { backgroundColor: AUTH_UI.colors.accent },
    text: { color: AUTH_UI.colors.accentText },
  },
  success: {
    container: {
      backgroundColor: "rgba(83,209,141,0.15)",
      borderWidth: 1,
      borderColor: "rgba(83,209,141,0.3)",
    },
    text: { color: AUTH_UI.colors.success },
  },
  danger: {
    container: {
      backgroundColor: "rgba(248,113,113,0.15)",
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.3)",
    },
    text: { color: AUTH_UI.colors.danger },
  },
  warning: {
    container: { backgroundColor: "#2A2200" },
    text: { color: "#C9A227" },
  },
  "on-tap": {
    container: {
      backgroundColor: "#2D2A0F",
      borderWidth: 1,
      borderColor: "#4A3F10",
    },
    text: { color: AUTH_UI.colors.accent },
  },
  "sat-hach": {
    container: {
      backgroundColor: "#1A1040",
      borderWidth: 1,
      borderColor: "#2D1F6B",
    },
    text: { color: "#A78BFA" },
  },
  critical: {
    container: {
      backgroundColor: "rgba(248,113,113,0.15)",
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.3)",
    },
    text: { color: AUTH_UI.colors.danger },
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
