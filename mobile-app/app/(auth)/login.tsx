import {
  AUTH_COLORS,
  AuthBackground,
  AuthCard,
  AuthTabSwitch,
  GradientButton,
  LightInput,
} from '@/components/AuthTheme';
import { getErrorMessage } from '@/services/api';
import { describeLocationError, requireLiveUserLocation } from '@/services/locationService';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Ionicons } from '@expo/vector-icons';
import { router, Href } from 'expo-router';
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const setLiveSource = useDashboardStore((s) => s.setLiveSource);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (mode === 'signup' && (!fullName.trim() || password.length < 8)) {
      setError('Name and a password of at least 8 characters are required');
      return;
    }

    setLoading(true);
    try {
      const locationPromise = requireLiveUserLocation();
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(fullName.trim(), email.trim(), password);
      }
      try {
        setLiveSource(await locationPromise);
      } catch {
        // LiveLocationGate will require GPS before Home opens.
      }
      router.replace('/(app)/' as Href);
    } catch (e) {
      setError(getErrorMessage(e, mode === 'login' ? 'Login failed' : 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  const onGuest = async () => {
    setGuestLoading(true);
    setError('');
    try {
      const locationPromise = requireLiveUserLocation();
      await continueAsGuest();
      try {
        setLiveSource(await locationPromise);
      } catch {
        // LiveLocationGate will require GPS before Home opens.
      }
      router.replace('/(app)/' as Href);
    } catch (e) {
      setError(describeLocationError(e) || 'Could not start guest mode');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.duration(420)} style={styles.brand}>
              <View style={styles.logoMark}>
                <Ionicons name="navigate" size={26} color="#fff" />
              </View>
              <Text style={styles.brandName}>UrbanLens</Text>
              <Text style={styles.brandSub}>AI Location Intelligence</Text>
            </Animated.View>

            <AuthCard>
              {mode === 'signup' ? (
                <Animated.View entering={FadeInUp.duration(280)}>
                  <Text style={styles.title}>Create account</Text>
                  <Text style={styles.subtitle}>
                    Join UrbanLens to save destinations and journey stories.
                  </Text>
                </Animated.View>
              ) : null}

              <AuthTabSwitch mode={mode} onChange={setMode} />

              {mode === 'signup' ? (
                <LightInput
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              ) : null}

              <LightInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <LightInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {mode === 'login' ? (
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotWrap}
                >
                  <Text style={styles.forgot}>Forgot password?</Text>
                </Pressable>
              ) : (
                <View style={styles.spacer} />
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <GradientButton
                label={mode === 'login' ? 'Sign in' : 'Create account'}
                onPress={onSubmit}
                loading={loading}
              />

              <View style={styles.footerRow}>
                {mode === 'login' ? (
                  <Text style={styles.footerText}>
                    Not a member?{' '}
                    <Text style={styles.footerLink} onPress={() => setMode('signup')}>
                      Sign up
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.footerText}>
                    Already a member?{' '}
                    <Text style={styles.footerLink} onPress={() => setMode('login')}>
                      Sign in
                    </Text>
                  </Text>
                )}
              </View>
            </AuthCard>

            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <Pressable onPress={onGuest} disabled={guestLoading} style={styles.guest}>
                <Text style={styles.guestText}>
                  {guestLoading ? 'Starting guest mode…' : 'Continue as guest'}
                </Text>
              </Pressable>
            </Animated.View>
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
    paddingVertical: 28,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(37,99,235,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(226,232,240,0.85)',
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: AUTH_COLORS.ink,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: AUTH_COLORS.muted,
    lineHeight: 20,
    marginBottom: 18,
  },
  forgotWrap: {
    marginBottom: 18,
    marginTop: -2,
  },
  forgot: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  spacer: { height: 8 },
  error: {
    color: '#DC2626',
    marginBottom: 12,
    fontSize: 13,
  },
  footerRow: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    color: '#334155',
    fontSize: 14,
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: '800',
  },
  guest: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '700',
  },
});
