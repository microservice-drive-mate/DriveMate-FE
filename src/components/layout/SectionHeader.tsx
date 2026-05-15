import { AUTH_UI } from "@/constants/auth-ui";
import { ms } from "@/utils/responsive";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: ms(15),
    fontWeight: "700",
    color: AUTH_UI.colors.textPrimary,
  },
  action: {
    fontSize: ms(13),
    color: AUTH_UI.colors.accent,
    fontWeight: "600",
  },
});
