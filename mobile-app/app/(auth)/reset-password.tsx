import {
  AUTH_COLORS,
  AuthBackground,
  AuthCard,
  GradientButton,
  LightInput,
} from '@/components/AuthTheme';
import { getErrorMessage } from '@/services/api';
import { resetPassword } from '@/services/authService';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    if (!token.trim() || password.length < 8) {
      setError('Token and a new password (min 8 characters) are required');
      return;
    }
    setLoading(true);
    try {
      const data = await resetPassword(token.trim(), password);
      setSuccess(data.message);
      setTimeout(() => router.replace('/(auth)/login'), 900);
    } catch (e) {
      setError(getErrorMessage(e, 'Reset failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <AuthCard>
              <Text style={styles.title}>Reset password</Text>
              <LightInput
                placeholder="Reset token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />
              <LightInput
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              <GradientButton label="Update password" onPress={onSubmit} loading={loading} />
            </AuthCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  back: { marginBottom: 16 },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: AUTH_COLORS.ink,
    marginBottom: 20,
  },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 13 },
  success: { color: AUTH_COLORS.link, marginBottom: 12, fontSize: 13 },
});
