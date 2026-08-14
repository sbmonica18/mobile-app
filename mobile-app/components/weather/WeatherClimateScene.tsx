import type { ClimateSceneConfig } from '@/constants/weatherTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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

type Props = {
  scene: ClimateSceneConfig;
  reduceMotion?: boolean;
  /** Home-matching light card: pale sky, no dark vignette. */
  tone?: 'cinematic' | 'cloud';
};

function DriftCloud({
  size,
  top,
  delay,
  duration,
  opacity,
  reduceMotion,
  light,
}: {
  size: number;
  top: number;
  delay: number;
  duration: number;
  opacity: number;
  reduceMotion: boolean;
  light?: boolean;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [delay, duration, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity, transform: [{ translateX: 0 }] };
    }
    return {
      opacity,
      transform: [
        { translateX: interpolate(t.value, [0, 1], [-40, 220], Extrapolation.CLAMP) },
        { translateY: Math.sin(t.value * Math.PI * 2) * 4 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.cloud,
        {
          width: size,
          height: size * 0.38,
          borderRadius: size * 0.2,
          top,
          left: -60,
          backgroundColor: light ? 'rgba(148,163,184,0.32)' : 'rgba(255,255,255,0.55)',
        },
        style,
      ]}
    />
  );
}

function RainDrop({
  index,
  heavy,
  reduceMotion,
}: {
  index: number;
  heavy: boolean;
  reduceMotion: boolean;
}) {
  const t = useSharedValue(0);
  const left = (index * 37) % 100;
  const duration = heavy ? 700 + (index % 5) * 80 : 1100 + (index % 6) * 120;

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      index * 70,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [duration, index, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(t.value, [0, 0.1, 0.9, 1], [0, 0.45, 0.45, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(t.value, [0, 1], [-20, 220], Extrapolation.CLAMP) },
        { translateX: interpolate(t.value, [0, 1], [0, heavy ? 8 : 4], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.rain,
        {
          left: `${left}%` as `${number}%`,
          height: heavy ? 16 : 10,
          width: heavy ? 1.4 : 1,
        },
        style,
      ]}
    />
  );
}

function Snowflake({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  const left = (index * 41) % 100;
  const size = 2 + (index % 3);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      index * 120,
      withRepeat(
        withTiming(1, { duration: 4500 + (index % 5) * 600, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [index, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(t.value, [0, 0.2, 0.8, 1], [0, 0.7, 0.7, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(t.value, [0, 1], [-10, 210], Extrapolation.CLAMP) },
        { translateX: Math.sin(t.value * Math.PI * 4) * 12 },
        { scale: interpolate(t.value, [0, 0.5, 1], [0.7, 1.1, 0.8], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.snow,
        {
          left: `${left}%` as `${number}%`,
          width: size,
          height: size,
          borderRadius: size,
        },
        style,
      ]}
    />
  );
}

function Star({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const twinkle = useSharedValue(0);
  const left = 8 + ((index * 29) % 84);
  const top = 8 + ((index * 17) % 55);
  const size = 1.5 + (index % 3) * 0.6;

  useEffect(() => {
    if (reduceMotion) return;
    twinkle.value = withDelay(
      index * 180,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900 + (index % 4) * 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 900 + (index % 3) * 200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [index, reduceMotion, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.35 : interpolate(twinkle.value, [0, 1], [0.15, 0.85]),
    transform: [{ scale: reduceMotion ? 1 : interpolate(twinkle.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        { left: `${left}%` as `${number}%`, top: `${top}%` as `${number}%`, width: size, height: size, borderRadius: size },
        style,
      ]}
    />
  );
}

function WindLine({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  const top = 30 + (index % 5) * 28;

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      index * 220,
      withRepeat(withTiming(1, { duration: 1800 + index * 200, easing: Easing.linear }), -1, false),
    );
  }, [index, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(t.value, [0, 0.2, 0.8, 1], [0, 0.35, 0.35, 0], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(t.value, [0, 1], [-30, 280], Extrapolation.CLAMP) }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.windLine, { top, width: 36 + (index % 3) * 10 }, style]}
    />
  );
}

function DustMote({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  const left = (index * 47) % 100;
  const top = 20 + (index % 6) * 22;

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      index * 160,
      withRepeat(
        withTiming(1, { duration: 5000 + index * 300, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [index, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0.08 };
    return {
      opacity: interpolate(t.value, [0, 0.5, 1], [0.05, 0.18, 0.05], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(t.value, [0, 1], [0, -16], Extrapolation.CLAMP) },
        { translateX: interpolate(t.value, [0, 1], [0, 10], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dust,
        { left: `${left}%` as `${number}%`, top },
        style,
      ]}
    />
  );
}

function FogLayer({
  top,
  delay,
  reduceMotion,
}: {
  top: number;
  delay: number;
  reduceMotion: boolean;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, reduceMotion, t]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0.12
      : interpolate(t.value, [0, 1], [0.08, 0.18], Extrapolation.CLAMP),
    transform: [
      { translateX: reduceMotion ? 0 : interpolate(t.value, [0, 1], [-20, 30], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.fog, { top, height: 70 }, style]}
    />
  );
}

function SunGlow({ reduceMotion }: { reduceMotion: boolean }) {
  const rot = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    rot.value = withRepeat(withTiming(1, { duration: 30000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion, rot]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0.35
      : interpolate(pulse.value, [0, 1], [0.28, 0.42], Extrapolation.CLAMP),
    transform: [
      { rotate: `${rot.value * 360}deg` },
      { scale: reduceMotion ? 1 : interpolate(pulse.value, [0, 1], [1, 1.06]) },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.sun, style]}>
      {[0, 45, 90, 135].map((deg) => (
        <View
          key={deg}
          style={[
            styles.sunRay,
            { transform: [{ rotate: `${deg}deg` }] },
          ]}
        />
      ))}
      <View style={styles.sunCore} />
    </Animated.View>
  );
}

function MoonGlow({ reduceMotion }: { reduceMotion: boolean }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0.45
      : interpolate(pulse.value, [0, 1], [0.35, 0.55], Extrapolation.CLAMP),
    transform: [{ scale: reduceMotion ? 1 : interpolate(pulse.value, [0, 1], [1, 1.05]) }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.moon, style]} />;
}

function LightningFlash({ reduceMotion }: { reduceMotion: boolean }) {
  const flash = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const schedule = () => {
      const wait = 8000 + Math.random() * 7000;
      const timer = setTimeout(() => {
        if (cancelled) return;
        flash.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0.15, { duration: 120 }),
          withTiming(0.7, { duration: 60 }),
          withTiming(0, { duration: 220 }),
        );
        schedule();
      }, wait);
      return timer;
    };
    const first = schedule();
    return () => {
      cancelled = true;
      clearTimeout(first);
    };
  }, [flash, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: flash.value * 0.35,
  }));

  return <Animated.View pointerEvents="none" style={[styles.lightning, style]} />;
}

function BirdSilhouette({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      1200 + index * 800,
      withRepeat(withTiming(1, { duration: 14000 + index * 2000, easing: Easing.linear }), -1, false),
    );
  }, [index, reduceMotion, t]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(t.value, [0, 0.1, 0.9, 1], [0, 0.35, 0.35, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(t.value, [0, 1], [-20, 300], Extrapolation.CLAMP) },
        { translateY: Math.sin(t.value * Math.PI * 2) * 8 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bird, { top: 28 + index * 18 }, style]}
    />
  );
}

function SceneLayers({
  scene,
  reduceMotion,
  light,
}: {
  scene: ClimateSceneConfig;
  reduceMotion: boolean;
  light?: boolean;
}) {
  const { effects } = scene;
  const rainCount = effects.rain === 'heavy' ? 18 : effects.rain === 'light' ? 10 : 0;
  const snowCount = effects.snow ? 14 : 0;
  const starCount = effects.stars ? 12 : 0;
  const cloudCount =
    effects.clouds === 'heavy' ? 4 : effects.clouds === 'medium' ? 3 : effects.clouds === 'light' ? 2 : 0;
  const windCount = effects.wind ? 5 : 0;
  const dustCount = effects.dust ? 8 : 0;

  const rains = useMemo(() => Array.from({ length: rainCount }, (_, i) => i), [rainCount]);
  const snows = useMemo(() => Array.from({ length: snowCount }, (_, i) => i), [snowCount]);
  const stars = useMemo(() => Array.from({ length: starCount }, (_, i) => i), [starCount]);
  const clouds = useMemo(() => Array.from({ length: cloudCount }, (_, i) => i), [cloudCount]);
  const winds = useMemo(() => Array.from({ length: windCount }, (_, i) => i), [windCount]);
  const dusts = useMemo(() => Array.from({ length: dustCount }, (_, i) => i), [dustCount]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {effects.sun ? <SunGlow reduceMotion={reduceMotion} /> : null}
      {effects.moon ? <MoonGlow reduceMotion={reduceMotion} /> : null}

      {clouds.map((i) => (
        <DriftCloud
          key={`c-${i}`}
          size={90 + i * 28}
          top={18 + i * 26}
          delay={i * 900}
          duration={22000 + i * 4000}
          opacity={effects.clouds === 'heavy' ? 0.22 : 0.14}
          reduceMotion={reduceMotion}
          light={light}
        />
      ))}

      {effects.fog || effects.mist
        ? [0, 1].map((i) => (
            <FogLayer key={`f-${i}`} top={40 + i * 55} delay={i * 1200} reduceMotion={reduceMotion} />
          ))
        : null}

      {rains.map((i) => (
        <RainDrop
          key={`r-${i}`}
          index={i}
          heavy={effects.rain === 'heavy'}
          reduceMotion={reduceMotion}
        />
      ))}

      {snows.map((i) => (
        <Snowflake key={`s-${i}`} index={i} reduceMotion={reduceMotion} />
      ))}

      {stars.map((i) => (
        <Star key={`st-${i}`} index={i} reduceMotion={reduceMotion} />
      ))}

      {winds.map((i) => (
        <WindLine key={`w-${i}`} index={i} reduceMotion={reduceMotion} />
      ))}

      {dusts.map((i) => (
        <DustMote key={`d-${i}`} index={i} reduceMotion={reduceMotion} />
      ))}

      {effects.birds
        ? [0, 1].map((i) => <BirdSilhouette key={`b-${i}`} index={i} reduceMotion={reduceMotion} />)
        : null}

      {effects.lightning ? <LightningFlash reduceMotion={reduceMotion} /> : null}

      {/* Street-light reflection for rainy night */}
      {scene.state === 'rainyNight' ? <View pointerEvents="none" style={styles.streetGlow} /> : null}
    </View>
  );
}

export const WeatherClimateScene = memo(function WeatherClimateScene({
  scene,
  tone = 'cinematic',
}: Props) {
  const reduceMotion = !!useReducedMotion();
  const cross = useSharedValue(1);
  const light = tone === 'cloud';

  useEffect(() => {
    cross.value = 0;
    cross.value = withTiming(1, {
      duration: reduceMotion ? 200 : 700,
      easing: Easing.inOut(Easing.quad),
    });
  }, [cross, reduceMotion, scene.state]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: cross.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]}>
      <LinearGradient
        colors={
          light
            ? ['#FFFFFF', '#F7F9FC', '#DBEAFE']
            : scene.gradient
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {!light ? (
        <View
          pointerEvents="none"
          style={[
            styles.ambient,
            {
              backgroundColor: scene.ambient,
              opacity: scene.ambientOpacity,
            },
          ]}
        />
      ) : null}

      <SceneLayers scene={scene} reduceMotion={reduceMotion} light={light} />

      {!light ? (
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.18)']}
          style={styles.vignette}
        />
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  ambient: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  rain: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(226,232,240,0.65)',
    borderRadius: 1,
  },
  snow: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  windLine: {
    position: 'absolute',
    left: 0,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dust: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fog: {
    position: 'absolute',
    left: -30,
    right: -30,
    backgroundColor: 'rgba(248,250,252,0.35)',
    borderRadius: 40,
  },
  sun: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDE68A',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  sunRay: {
    position: 'absolute',
    width: 70,
    height: 2,
    backgroundColor: 'rgba(253,230,138,0.35)',
    borderRadius: 1,
  },
  moon: {
    position: 'absolute',
    top: 16,
    right: 22,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    shadowColor: '#E0E7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },
  lightning: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E0E7FF',
  },
  bird: {
    position: 'absolute',
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  streetGlow: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: '60%',
    height: 40,
    borderRadius: 40,
    backgroundColor: 'rgba(251,191,36,0.12)',
  },
});
