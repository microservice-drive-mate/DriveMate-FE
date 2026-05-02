import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { ScreenWrapper } from '@/components/screen-wrapper';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setTokens, setUser } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({ name, email, phone, password });
      await setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch {
      Alert.alert('Đăng ký thất bại', 'Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper keyboard scroll contentStyle={styles.inner}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Bắt đầu luyện thi bằng lái xe</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9BA1A6"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#9BA1A6"
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#9BA1A6"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9BA1A6"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Đã có tài khoản? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Đăng nhập</Text>
          </TouchableOpacity>
        </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inner: { justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#11181C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#687076', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#11181C',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { fontSize: 14, color: '#687076' },
  linkBold: { color: '#0a7ea4', fontWeight: '600' },
});
