import { AUTH_UI } from "@/constants/auth-ui";
import { colors, withAlpha } from "@/theme";
import { ms, s } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type OptionState = "default" | "selected" | "correct" | "wrong" | "dimmed";

interface OptionCardProps {
  letter: string;
  text: string;
  state?: OptionState;
  onPress?: () => void;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIconColor?: string;
}

export function OptionCard({
  letter,
  text,
  state = "default",
  onPress,
  trailingIcon,
  trailingIconColor,
}: OptionCardProps) {
  const isSelected = state === "selected";
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const isDimmed = state === "dimmed";

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { onPress, activeOpacity: 0.7 as number }
    : {};

  return (
    <Container
      style={[
        styles.option,
        isSelected && styles.optionSelected,
        isCorrect && styles.optionCorrect,
        isWrong && styles.optionWrong,
      ]}
      {...containerProps}>
      <View
        style={[
          styles.badge,
          isSelected && styles.badgeSelected,
          isCorrect && styles.badgeCorrect,
          isWrong && styles.badgeWrong,
        ]}>
        <Text
          style={[
            styles.badgeText,
            (isSelected || isCorrect || isWrong) && styles.badgeTextActive,
            isDimmed && styles.dimmed,
          ]}>
          {letter}
        </Text>
      </View>
      <Text
        style={[
          styles.text,
          isSelected && styles.textSelected,
          isCorrect && styles.textCorrect,
          isWrong && styles.textWrong,
          isDimmed && styles.dimmed,
        ]}>
        {text}
      </Text>
      {trailingIcon && (
        <Ionicons
          name={trailingIcon}
          size={ms(18)}
          color={trailingIconColor ?? AUTH_UI.colors.textMuted}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: ms(AUTH_UI.radius.xl),
    padding: s(12),
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionSelected: {
    borderColor: AUTH_UI.colors.accent,
    backgroundColor: withAlpha(colors.accent, 0.08),
  },
  optionCorrect: {
    borderColor: AUTH_UI.colors.success,
    backgroundColor: withAlpha(colors.success, 0.1),
  },
  optionWrong: {
    borderColor: AUTH_UI.colors.danger,
    backgroundColor: withAlpha(colors.danger, 0.12),
  },
  badge: {
    width: s(32),
    height: s(32),
    borderRadius: ms(16),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSelected: {
    backgroundColor: AUTH_UI.colors.accent,
  },
  badgeCorrect: {
    backgroundColor: AUTH_UI.colors.success,
  },
  badgeWrong: {
    backgroundColor: AUTH_UI.colors.danger,
  },
  badgeText: {
    fontSize: ms(13),
    fontWeight: "700",
    color: AUTH_UI.colors.textSecondary,
  },
  badgeTextActive: {
    color: AUTH_UI.colors.accentText,
  },
  text: {
    flex: 1,
    fontSize: ms(13),
    color: AUTH_UI.colors.textSecondary,
    lineHeight: ms(20),
  },
  textSelected: {
    color: AUTH_UI.colors.textPrimary,
    fontWeight: "500",
  },
  textCorrect: {
    color: AUTH_UI.colors.success,
    fontWeight: "600",
  },
  textWrong: {
    color: AUTH_UI.colors.danger,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.5,
  },
});
