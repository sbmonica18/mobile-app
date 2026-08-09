import { CLOUD } from '@/constants/cloudTheme';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';

const ORB = 112;
const LOGO = ORB * 0.65;
const RING = ORB + 28;
const GLOW = 150;

const OrbitParticle = memo(function OrbitParticle({
  index,
  count,
  reduceMotion,
}: {
  index: number;
  count: number;
  reduceMotion: boolean;
}) {
  const progress = useSharedValue(0);
  const baseAngle = (index / count) * Math.PI * 2;
  const radius = RING / 2 + 4;
  const palette = [CLOUD.primary, CLOUD.aiAccent, '#94A3B8'];
  const color = palette[index % 3];
  const size = 2.2 + (index % 3) * 0.5;

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(
      index * 80,
      withRepeat(withTiming(1, { duration: 10000 + index * 400, easing: Easing.linear }), -1, false),
    );
  }, [index, progress, reduceMotion]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    const a = baseAngle + progress.value * Math.PI * 2;
    return {
      opacity: interpolate(progress.value % 1, [0, 0.5, 1], [0.25, 0.7, 0.25], Extrapolation.CLAMP),
      transform: [
        { translateX: Math.cos(a) * radius },
        { translateY: Math.sin(a) * radius },
        {
          scale: interpolate(progress.value % 1, [0, 0.5, 1], [0.8, 1.15, 0.8], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size, backgroundColor: color },
        style,
      ]}
    />
  );
});

type Props = {
  size?: number;
  onPress?: () => void;
};

export const AiThinkingOrb = memo(function AiThinkingOrb({ size = ORB, onPress }: Props) {
  const reduceMotion = !!useReducedMotion();
  const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const scale = size / ORB;
  const orb = size;
  const logo = size * 0.65;
  const ring = size + 28 * scale;
  const glow = GLOW * scale;

  const breath = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glowPulse = useSharedValue(0.9);
  const ringRot = useSharedValue(0);
  const innerPulse = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const ripple = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    floatY.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    ringRot.value = withRepeat(withTiming(1, { duration: 22000, easing: Easing.linear }), -1, false);
    innerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 1600, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [breath, floatY, glowPulse, innerPulse, reduceMotion, ringRot]);

  const shellStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return {
      transform: [
        { translateY: interpolate(floatY.value, [0, 1], [0, -4], Extrapolation.CLAMP) },
        {
          scale:
            interpolate(breath.value, [0, 1], [1, 1.03], Extrapolation.CLAMP) * tapScale.value,
        },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0.18
      : interpolate(glowPulse.value, [0, 1], [0.16, 0.28], Extrapolation.CLAMP),
    transform: [{ scale: reduceMotion ? 1 : interpolate(glowPulse.value, [0, 1], [0.92, 1.05]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRot.value * 360}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(innerPulse.value, [0, 1], [0.22, 0], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(innerPulse.value, [0, 1], [1, 1.55], Extrapolation.CLAMP) }],
    };
  });

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ripple.value, [0, 1], [0.35, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(ripple.value, [0, 1], [1, 1.45], Extrapolation.CLAMP) }],
  }));

  const handlePress = useCallback(() => {
    tapScale.value = withSequence(
      withTiming(0.96, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 180, easing: Easing.inOut(Easing.quad) }),
    );
    ripple.value = 0;
    ripple.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress, ripple, tapScale]);

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel="UrbanLens AI">
      <Animated.View style={[styles.wrap, { width: ring + 24, height: ring + 24 }, shellStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: glow,
              height: glow,
              borderRadius: glow / 2,
              backgroundColor: CLOUD.primary,
            },
            glowStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.intelPulse,
            {
              width: orb,
              height: orb,
              borderRadius: orb / 2,
              borderColor: CLOUD.aiAccent,
            },
            pulseStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            { width: orb, height: orb, borderRadius: orb / 2, borderColor: CLOUD.primary },
            rippleStyle,
          ]}
        />

        <Animated.View style={[{ position: 'absolute', width: ring, height: ring }, ringStyle]}>
          <Svg width={ring} height={ring}>
            <Defs>
              <SvgGrad id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={CLOUD.primary} stopOpacity="0.35" />
                <Stop offset="100%" stopColor={CLOUD.aiAccent} stopOpacity="0.2" />
              </SvgGrad>
            </Defs>
            <Circle
              cx={ring / 2}
              cy={ring / 2}
              r={ring / 2 - 1.5}
              stroke="url(#ringGrad)"
              strokeWidth={1.2}
              fill="none"
              strokeDasharray={`${Math.PI * (ring / 2 - 1.5) * 0.55} ${Math.PI * (ring / 2 - 1.5) * 0.45}`}
            />
          </Svg>
        </Animated.View>

        {particles.map((i) => (
          <OrbitParticle key={i} index={i} count={particles.length} reduceMotion={reduceMotion} />
        ))}

        <View
          style={[
            styles.orb,
            {
              width: orb,
              height: orb,
              borderRadius: orb / 2,
            },
          ]}
        >
          {Platform.OS === 'web' ? (
            <LinearGradient
              colors={['rgba(255,255,255,0.92)', 'rgba(219,234,254,0.75)', 'rgba(237,233,254,0.7)']}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(37,99,235,0.08)', 'rgba(124,58,237,0.1)']}
            style={StyleSheet.absoluteFill}
          />
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: logo, height: logo }}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
  },
  intelPulse: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  orb: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    ...CLOUD.shadows.hero,
  },
  particle: {
    position: 'absolute',
  },
});
