import { IconBox } from "@/components/common/IconBox";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

export function MenuRow({ icon, label, value, onPress }: MenuRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <IconBox icon={icon} />
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          {value && <Text style={styles.value}>{value}</Text>}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={ms(18)}
        color={AUTH_UI.colors.textSecondary}
      />
    </TouchableOpacity>
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
    color: AUTH_UI.colors.textPrimary,
    fontWeight: "700",
  },
  value: {
    color: AUTH_UI.colors.textSecondary,
    marginTop: vs(2),
    fontSize: ms(12),
  },
});
