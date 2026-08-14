import { CLOUD } from '@/constants/cloudTheme';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
  onExploreAi: () => void;
};

function ScalePressable({
  children,
  onPress,
  style,
  pulseEnabled = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
  pulseEnabled?: boolean;
}) {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);
  const shadow = useSharedValue(0);
  const isPressed = useSharedValue(0);

  useEffect(() => {
    if (!pulseEnabled || reduceMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.03, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, pulseEnabled, reduceMotion]);

  const anim = useAnimatedStyle(() => {
    const pulseScale = isPressed.value ? 1 : pulse.value;
    return {
      transform: [{ scale: pulseScale * press.value }],
      shadowOpacity: 0.16 + shadow.value * 0.14,
      shadowRadius: 18 + shadow.value * 8,
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        isPressed.value = 1;
        press.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        shadow.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        isPressed.value = 0;
        press.value = withSpring(1, { damping: 14, stiffness: 220 });
        shadow.value = withTiming(0, { duration: 180 });
      }}
      onPress={() => {
        // Click pop: quick lift then settle
        press.value = withSequence(
          withSpring(0.94, { damping: 16, stiffness: 380 }),
          withSpring(1.02, { damping: 12, stiffness: 280 }),
          withSpring(1, { damping: 14, stiffness: 220 }),
        );
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

function MiniOrb() {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    rot.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1, false);
  }, [pulse, reduceMotion, rot]);

  const glow = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0.25
      : interpolate(pulse.value, [0, 1], [0.2, 0.4], Extrapolation.CLAMP),
    transform: [{ scale: reduceMotion ? 1 : interpolate(pulse.value, [0, 1], [0.95, 1.08]) }],
  }));

  const ring = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }));

  return (
    <View style={styles.orbWrap}>
      <Animated.View style={[styles.orbGlow, glow]} />
      <Animated.View style={[styles.orbRing, ring]} />
      <LinearGradient
        colors={['#DBEAFE', '#EDE9FE']}
        style={styles.orbCore}
      >
        <Ionicons name="sparkles" size={18} color={CLOUD.aiAccent} />
      </LinearGradient>
    </View>
  );
}

export function HomeAiLaunchpad({ onExploreAi }: Props) {
  const reduceMotion = !!useReducedMotion();
  const sweep = useSharedValue(0);
  const colors = useThemeStore((s) => s.colors);
  const { width } = useWindowDimensions();
  const compact = width < 380;

  useEffect(() => {
    if (reduceMotion) return;
    sweep.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 3600 }),
      ),
      -1,
      false,
    );
  }, [reduceMotion, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 0.5, 1], [0, 0.35, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(sweep.value, [0, 1], [-40, 220], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderColor: colors.lightBlue,
          padding: compact ? 16 : 22,
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(37,99,235,0.08)', 'rgba(124,58,237,0.07)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.meshDot} />
      <View style={[styles.meshDot, styles.meshDot2]} />

      <View style={styles.topRow}>
        <MiniOrb />
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: colors.aiAccent }]}>UrbanLens AI</Text>
          <Text
            style={[styles.headline, { color: colors.ink, fontSize: compact ? 20 : 24, lineHeight: compact ? 26 : 30 }]}
          >Let AI plan your perfect trip</Text>
          <Text style={[styles.subline, { color: colors.body }]}>
            AI-powered recommendations, tailored to right now
          </Text>
        </View>
      </View>

      <ScalePressable onPress={onExploreAi} style={styles.ctaOuter} pulseEnabled>
        <LinearGradient
          colors={[CLOUD.primary, '#4F46E5', CLOUD.primary]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.cta}
        >
          <Animated.View pointerEvents="none" style={[styles.ctaSweep, sweepStyle]} />
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.ctaText}>Explore with AI</Text>
        </LinearGradient>
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: 22,
    borderWidth: 1.5,
    borderColor: CLOUD.lightBlue,
    overflow: 'hidden',
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 5,
  },
  meshDot: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: CLOUD.primary,
    opacity: 0.04,
    right: -20,
    top: -10,
  },
  meshDot2: {
    backgroundColor: CLOUD.aiAccent,
    left: -30,
    top: 80,
    right: undefined,
  },
  topRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  copy: { flex: 1 },
  orbWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CLOUD.aiAccent,
  },
  orbRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.35)',
    borderStyle: 'dashed',
  },
  orbCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  kicker: {
    color: CLOUD.aiAccent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headline: {
    color: CLOUD.ink,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  subline: {
    marginTop: 8,
    color: CLOUD.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  ctaOuter: {
    borderRadius: CLOUD.radii.button,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
    backgroundColor: CLOUD.primary,
  },
  cta: {
    height: 52,
    minHeight: 48,
    borderRadius: CLOUD.radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  ctaSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
