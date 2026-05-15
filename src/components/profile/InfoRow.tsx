import { IconBox } from "@/components/common/IconBox";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <IconBox icon={icon} />
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: vs(10),
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  textBlock: {
    marginLeft: s(10),
  },
  label: {
    color: AUTH_UI.colors.textSecondary,
    fontSize: ms(11),
  },
  value: {
    color: AUTH_UI.colors.textPrimary,
    fontSize: ms(14),
    fontWeight: "600",
    marginTop: vs(2),
  },
});
