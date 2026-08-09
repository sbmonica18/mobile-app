import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const AUTH_COLORS = {
  navy: '#0B1B4A',
  navyDeep: '#050E28',
  blue: '#3B82F6',
  blueMid: '#2563EB',
  card: 'rgba(255,255,255,0.96)',
  ink: '#0F172A',
  muted: '#64748B',
  border: 'rgba(255,255,255,0.35)',
  link: '#93C5FD',
  bg: '#07122F',
  accent: '#22D3EE',
};

export function AuthBackground({ children }: { children: ReactNode }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift]);

  const orbA = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-18, 22]) },
      { translateY: interpolate(drift.value, [0, 1], [0, 16]) },
    ],
  }));
  const orbB = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [12, -20]) },
      { translateY: interpolate(drift.value, [0, 1], [8, -14]) },
    ],
  }));

  return (
    <LinearGradient colors={['#050E28', '#0B1B4A', '#123A8A']} style={styles.bg}>
      <Animated.View style={[styles.orb, styles.orbCyan, orbA]} />
      <Animated.View style={[styles.orb, styles.orbBlue, orbB]} />
      {children}
    </LinearGradient>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.cardWrap}>
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)']}
        style={styles.cardGlow}
      >
        <View style={styles.card}>{children}</View>
      </LinearGradient>
    </Animated.View>
  );
}

export function GradientButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [{ opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1 }]}
    >
      <LinearGradient
        colors={['#22D3EE', '#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBtn}
      >
        <Text style={styles.gradientBtnText}>{loading ? 'Please wait…' : label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function AuthTabSwitch({
  mode,
  onChange,
}: {
  mode: 'login' | 'signup';
  onChange: (mode: 'login' | 'signup') => void;
}) {
  return (
    <View style={styles.tabTrack}>
      <Pressable style={styles.tabHalf} onPress={() => onChange('login')}>
        {mode === 'login' ? (
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.tabActive}>
            <Text style={styles.tabActiveText}>Login</Text>
          </LinearGradient>
        ) : (
          <View style={styles.tabIdle}>
            <Text style={styles.tabIdleText}>Login</Text>
          </View>
        )}
      </Pressable>
      <Pressable style={styles.tabHalf} onPress={() => onChange('signup')}>
        {mode === 'signup' ? (
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.tabActive}>
            <Text style={styles.tabActiveText}>Signup</Text>
          </LinearGradient>
        ) : (
          <View style={styles.tabIdle}>
            <Text style={styles.tabIdleText}>Signup</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export function LightInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#94A3B8"
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  orb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.45,
  },
  orbCyan: {
    top: -40,
    right: -50,
    backgroundColor: '#22D3EE',
  },
  orbBlue: {
    bottom: 80,
    left: -70,
    backgroundColor: '#3B82F6',
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  cardGlow: {
    borderRadius: 28,
    padding: 1.5,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  gradientBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    padding: 4,
    marginBottom: 22,
  },
  tabHalf: { flex: 1 },
  tabActive: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabActiveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  tabIdle: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabIdleText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
});
