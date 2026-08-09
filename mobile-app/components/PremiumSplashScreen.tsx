import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo } from 'react';
import { AccessibilityInfo, Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAGLINE = 'AI Location Intelligence Platform';
const ORB = 120;
const LOGO = ORB * 0.65;
const RING1 = ORB + 22;
const RING2 = ORB + 44;
const GLOW = 168;

type Props = { onFinished: () => void };

function AmbientBlob({
  size,
  color,
  left,
  top,
  duration,
  delay,
  reduceMotion,
}: {
  size: number;
  color: string;
  left: number | `${number}%`;
  top: number | `${number}%`;
  duration: number;
  delay: number;
  reduceMotion: boolean;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, duration, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0.07 };
    return {
      opacity: interpolate(t.value, [0, 1], [0.05, 0.1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(t.value, [0, 1], [0, -26], Extrapolation.CLAMP) },
        { translateX: interpolate(t.value, [0, 1], [0, 14], Extrapolation.CLAMP) },
        { scale: interpolate(t.value, [0, 1], [1, 1.1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        { width: size, height: size, borderRadius: size / 2, left, top, backgroundColor: color },
        style,
      ]}
    />
  );
}

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
  const radius = RING2 / 2 + 2;
  const palette = ['#2563EB', '#7C3AED', '#FFFFFF'];
  const color = palette[index % 3];
  const size = 2 + (index % 3) * 0.6;

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(
      1300 + index * 90,
      withRepeat(
        withTiming(1, { duration: 9000 + index * 350, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [index, progress, reduceMotion]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    const a = baseAngle + progress.value * Math.PI * 2;
    return {
      opacity: interpolate(progress.value % 1, [0, 0.5, 1], [0.2, 0.55, 0.2], Extrapolation.CLAMP),
      transform: [
        { translateX: Math.cos(a) * radius },
        { translateY: Math.sin(a) * radius },
        {
          scale: interpolate(progress.value % 1, [0, 0.5, 1], [0.75, 1.2, 0.75], Extrapolation.CLAMP),
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

function NavGrid() {
  const lines = useMemo(() => {
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const v = (i + 1) / 9;
      out.push({ key: `v${i}`, x1: v, y1: 0, x2: v, y2: 1 });
      out.push({ key: `h${i}`, x1: 0, y1: v, x2: 1, y2: v });
    }
    return out;
  }, []);

  return (
    <View pointerEvents="none" style={styles.grid}>
      <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
        {lines.map((l) => (
          <Line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#FFFFFF"
            strokeWidth={0.0015}
            opacity={0.03}
          />
        ))}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((x, i) =>
          [0.25, 0.45, 0.65, 0.8].map((y, j) => (
            <Circle
              key={`d-${i}-${j}`}
              cx={x + (j % 2) * 0.03}
              cy={y}
              r={0.004}
              fill="#FFFFFF"
              opacity={0.03}
            />
          )),
        )}
      </Svg>
    </View>
  );
}

export function PremiumSplashScreen({ onFinished }: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = !!useReducedMotion();
  const particles = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);

  const bgDrift = useSharedValue(0);
  const glow = useSharedValue(0);
  const orbIn = useSharedValue(0);
  const logoIn = useSharedValue(0);
  const breath = useSharedValue(0);
  const glowPulse = useSharedValue(0.9);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const reflection = useSharedValue(0);
  const intelPulse = useSharedValue(0);
  const wordOp = useSharedValue(0);
  const wordY = useSharedValue(16);
  const wordScale = useSharedValue(0.98);
  const tagOp = useSharedValue(0);
  const tagBlur = useSharedValue(1);
  const exitOp = useSharedValue(1);

  useEffect(() => {
    let cancelled = false;
    let started = false;

    const finish = () => {
      if (!cancelled) onFinished();
    };

    const runReduced = () => {
      if (started || cancelled) return;
      started = true;
      orbIn.value = 1;
      logoIn.value = 1;
      glow.value = 1;
      wordOp.value = 1;
      wordY.value = 0;
      wordScale.value = 1;
      tagOp.value = 0.75;
      tagBlur.value = 0;
      exitOp.value = withDelay(
        900,
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.cubic) }, (d) => {
          if (d) runOnJS(finish)();
        }),
      );
    };

    const runFull = () => {
      if (started || cancelled) return;
      started = true;

      // 0ms — background breathes
      bgDrift.value = withRepeat(
        withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );

      // 500ms — glow
      glow.value = withDelay(500, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
      glowPulse.value = withDelay(
        500,
        withRepeat(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          -1,
          true,
        ),
      );

      // 700ms — glass orb
      orbIn.value = withDelay(700, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));

      // 900ms — logo scale in
      logoIn.value = withDelay(900, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }));

      // continuous breath after orb appears
      breath.value = withDelay(
        700,
        withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true),
      );

      // 1100ms — rings
      ring1.value = withDelay(
        1100,
        withRepeat(withTiming(360, { duration: 18000, easing: Easing.linear }), -1, false),
      );
      ring2.value = withDelay(
        1100,
        withRepeat(withTiming(-360, { duration: 24000, easing: Easing.linear }), -1, false),
      );

      // 1500ms — reflection
      reflection.value = withDelay(
        1500,
        withRepeat(withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.cubic) }), -1, false),
      );

      // intelligence pulse every 3s
      intelPulse.value = withDelay(
        1200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 0 }),
            withTiming(0, { duration: 1800 }),
          ),
          -1,
          false,
        ),
      );

      // 1700ms — wordmark
      wordOp.value = withDelay(1700, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
      wordY.value = withDelay(1700, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
      wordScale.value = withDelay(
        1700,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
      );

      // 2200ms — tagline sharpen
      tagOp.value = withDelay(2200, withTiming(0.75, { duration: 600, easing: Easing.out(Easing.cubic) }));
      tagBlur.value = withDelay(2200, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

      // 3800ms fade → 4300ms navigate
      exitOp.value = withDelay(
        3800,
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.cubic) }, (d) => {
          if (d) runOnJS(finish)();
        }),
      );
    };

    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => {
        if (cancelled) return;
        if (enabled || reduceMotion) runReduced();
        else runFull();
      })
      .catch(() => {
        if (!cancelled) (reduceMotion ? runReduced : runFull)();
      });

    const safety = setTimeout(finish, reduceMotion ? 1600 : 4800);
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [
    bgDrift,
    breath,
    exitOp,
    glow,
    glowPulse,
    intelPulse,
    logoIn,
    onFinished,
    orbIn,
    reduceMotion,
    reflection,
    ring1,
    ring2,
    tagBlur,
    tagOp,
    wordOp,
    wordScale,
    wordY,
  ]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(bgDrift.value, [0, 1], [0, 14], Extrapolation.CLAMP) },
      { scale: interpolate(bgDrift.value, [0, 1], [1.02, 1.06], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity:
      glow.value *
      interpolate(glowPulse.value, [0.9, 1], [0.18, 0.22], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(breath.value, [0, 1], [1, 1.05], Extrapolation.CLAMP) }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : interpolate(intelPulse.value, [0, 1], [0.2, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(intelPulse.value, [0, 1], [1, 1.6], Extrapolation.CLAMP) }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbIn.value,
    transform: [
      {
        translateY: reduceMotion
          ? 0
          : interpolate(breath.value, [0, 1], [0, -4], Extrapolation.CLAMP),
      },
      {
        scale:
          orbIn.value *
          (reduceMotion ? 1 : interpolate(breath.value, [0, 1], [1, 1.03], Extrapolation.CLAMP)),
      },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoIn.value,
    transform: [{ scale: interpolate(logoIn.value, [0, 1], [0.92, 1], Extrapolation.CLAMP) }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.25 * orbIn.value,
    transform: [{ rotate: `${ring1.value}deg` }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.18 * orbIn.value,
    transform: [{ rotate: `${ring2.value}deg` }],
  }));

  const reflectionStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0
      : interpolate(reflection.value, [0, 0.3, 0.7, 1], [0, 0.28, 0.28, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(reflection.value, [0, 1], [-ORB * 0.9, ORB * 0.9], Extrapolation.CLAMP),
      },
      {
        translateY: interpolate(reflection.value, [0, 1], [-ORB * 0.35, ORB * 0.35], Extrapolation.CLAMP),
      },
      { rotate: '28deg' },
    ],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOp.value,
    transform: [{ translateY: wordY.value }, { scale: wordScale.value }],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOp.value,
    transform: [{ scale: interpolate(tagBlur.value, [1, 0], [1.04, 1], Extrapolation.CLAMP) }],
  }));

  const rootStyle = useAnimatedStyle(() => ({ opacity: exitOp.value }));

  return (
    <Animated.View
      style={[styles.root, rootStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={['#071E52', '#0A2A6E', '#123A8A']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <NavGrid />

      {!reduceMotion ? (
        <>
          <AmbientBlob size={240} color="#2563EB" left="-12%" top="8%" duration={18000} delay={300} reduceMotion={false} />
          <AmbientBlob size={160} color="#7C3AED" left="68%" top="18%" duration={16000} delay={500} reduceMotion={false} />
          <AmbientBlob size={120} color="#14B8A6" left="58%" top="68%" duration={20000} delay={700} reduceMotion={false} />
          <AmbientBlob size={140} color="#2563EB" left="5%" top="58%" duration={15000} delay={400} reduceMotion={false} />
        </>
      ) : null}

      <View style={styles.center}>
        <View style={styles.coreStage}>
          <Animated.View style={[styles.intelPulse, pulseStyle]} />
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Ring 1 — solid thin blue, clockwise */}
          <Animated.View style={[styles.ringBox, { width: RING1, height: RING1 }, ring1Style]}>
            <Svg width={RING1} height={RING1}>
              <Circle
                cx={RING1 / 2}
                cy={RING1 / 2}
                r={(RING1 - 2) / 2}
                stroke="#2563EB"
                strokeWidth={1.5}
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Ring 2 — segmented blue→purple, counter-clockwise */}
          <Animated.View style={[styles.ringBox, { width: RING2, height: RING2 }, ring2Style]}>
            <Svg width={RING2} height={RING2}>
              <Defs>
                <SvgGrad id="segRing" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#2563EB" />
                  <Stop offset="100%" stopColor="#7C3AED" />
                </SvgGrad>
              </Defs>
              <Circle
                cx={RING2 / 2}
                cy={RING2 / 2}
                r={(RING2 - 3) / 2}
                stroke="url(#segRing)"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * (RING2 - 3) * 0.55} ${Math.PI * (RING2 - 3) * 0.45}`}
              />
            </Svg>
          </Animated.View>

          {/* Ring 3 — orbiting particles */}
          <View style={styles.particleField} pointerEvents="none">
            {particles.map((i) => (
              <OrbitParticle key={i} index={i} count={particles.length} reduceMotion={reduceMotion} />
            ))}
          </View>

          <Animated.View style={[styles.orbWrap, orbStyle]}>
            <View style={styles.orbShadow} />
            <View style={styles.orb}>
              {Platform.OS !== 'web' ? (
                <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.orbWeb]} />
              )}
              <View style={styles.orbFill} />
              <Animated.View style={logoStyle}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.reflection, reflectionStyle]} />
            </View>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.wordmark, wordStyle]}>
          Urban<Text style={styles.lens}>Lens</Text>
        </Animated.Text>
        <Animated.Text style={[styles.tagline, tagStyle]}>{TAGLINE}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071E52' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 1 },
  blob: { position: 'absolute' },
  coreStage: {
    width: RING2 + 48,
    height: RING2 + 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  glow: {
    position: 'absolute',
    width: GLOW,
    height: GLOW,
    borderRadius: GLOW / 2,
    backgroundColor: '#2563EB',
  },
  intelPulse: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.45)',
    backgroundColor: 'transparent',
  },
  ringBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleField: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: { position: 'absolute' },
  orbWrap: {
    width: ORB,
    height: ORB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbShadow: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    backgroundColor: 'rgba(37,99,235,0.18)',
    transform: [{ scale: 1.12 }],
  },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  orbWeb: { backgroundColor: 'rgba(255,255,255,0.14)' },
  orbFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logo: {
    width: LOGO,
    height: LOGO,
  },
  reflection: {
    position: 'absolute',
    width: 34,
    top: -12,
    bottom: -12,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  lens: { color: '#2563EB' },
  tagline: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
