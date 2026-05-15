import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, ViewStyle } from "react-native";

interface IconBoxProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  bg?: string;
  color?: string;
  boxSize?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function IconBox({
  icon,
  size = ms(18),
  bg,
  color,
  boxSize = s(40),
  borderRadius = ms(10),
  style,
}: IconBoxProps) {
  return (
    <View
      style={[
        styles.box,
        {
          width: boxSize,
          height: boxSize,
          borderRadius,
          backgroundColor: bg ?? AUTH_UI.colors.surfaceMuted,
        },
        style,
      ]}>
      <Ionicons name={icon} size={size} color={color ?? AUTH_UI.colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
});
