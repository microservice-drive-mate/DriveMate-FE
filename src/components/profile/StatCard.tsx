import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(AUTH_UI.radius.lg),
    padding: s(12),
    alignItems: "center",
  },
  value: {
    color: AUTH_UI.colors.accent,
    fontWeight: "900",
    fontSize: ms(18),
  },
  label: {
    color: AUTH_UI.colors.textSecondary,
    fontSize: ms(12),
    marginTop: vs(6),
  },
});
