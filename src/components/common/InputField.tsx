import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  containerStyle?: ViewStyle;
  error?: string | null;
}

export function InputField({
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  error,
  style,
  ...rest
}: InputFieldProps) {
  return (
    <View>
      <View style={[styles.container, containerStyle, error && styles.containerError]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={ms(18)} color={AUTH_UI.colors.textMuted} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={AUTH_UI.colors.textMuted}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} disabled={!onRightPress}>
            <Ionicons name={rightIcon} size={ms(18)} color={AUTH_UI.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: vs(50),
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
    borderRadius: ms(AUTH_UI.radius.lg),
    backgroundColor: AUTH_UI.colors.surface,
    paddingHorizontal: s(14),
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
    marginBottom: vs(12),
  },
  containerError: {
    borderColor: AUTH_UI.colors.danger,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    fontSize: ms(15),
    color: AUTH_UI.colors.textPrimary,
    padding: 0,
  },
  errorText: {
    color: AUTH_UI.colors.danger,
    fontSize: ms(12),
    marginTop: vs(6),
    marginBottom: vs(12),
  },
});
