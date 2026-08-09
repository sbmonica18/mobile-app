import {
  AUTH_COLORS,
  AuthBackground,
  AuthCard,
  GradientButton,
  LightInput,
} from '@/components/AuthTheme';
import { getErrorMessage } from '@/services/api';
import { forgotPassword } from '@/services/authService';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message);
      if (data.resetToken) {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { token: data.resetToken },
        });
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Request failed'));
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
              <Text style={styles.title}>Forgot password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we’ll issue a reset token for your account.
              </Text>
              <LightInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              <GradientButton label="Send reset link" onPress={onSubmit} loading={loading} />
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
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 13 },
  message: { color: AUTH_COLORS.link, marginBottom: 12, fontSize: 13 },
});
