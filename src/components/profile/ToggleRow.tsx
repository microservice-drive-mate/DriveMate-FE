import { IconBox } from "@/components/common/IconBox";
import { AUTH_UI } from "@/constants/auth-ui";
import { s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

interface ToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ icon, label, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <IconBox icon={icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? AUTH_UI.colors.accentText : undefined}
        trackColor={{
          true: AUTH_UI.colors.accent,
          false: AUTH_UI.colors.surfaceMuted,
        }}
      />
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
    gap: s(10),
  },
  label: {
    color: AUTH_UI.colors.textPrimary,
    fontWeight: "700",
  },
});
