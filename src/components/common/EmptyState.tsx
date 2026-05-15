import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, subtitle, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={ms(56)} color={AUTH_UI.colors.disabled} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: vs(60),
    gap: s(12),
  },
  title: {
    fontSize: ms(15),
    fontWeight: "600",
    color: AUTH_UI.colors.textSecondary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: ms(13),
    color: AUTH_UI.colors.textMuted,
    textAlign: "center",
    lineHeight: ms(20),
  },
});
