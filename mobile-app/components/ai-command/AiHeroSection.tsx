import { CLOUD } from '@/constants/cloudTheme';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AiThinkingOrb } from './AiThinkingOrb';

const SUBTITLES = [
  'Finding hidden gems...',
  'Analyzing weather...',
  'Checking traffic...',
  'Looking for scenic routes...',
  'Finding quieter destinations...',
  'Planning your perfect weekend...',
];

const HEADLINES = ['Where should we explore today?', "Let's plan something amazing."];

function MeshBlob({
  color,
  size,
  left,
  top,
  duration,
  delay,
  reduceMotion,
}: {
  color: string;
  size: number;
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
    if (reduceMotion) return { opacity: 0.05 };
    return {
      opacity: interpolate(t.value, [0, 1], [0.04, 0.08], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(t.value, [0, 1], [0, -10], Extrapolation.CLAMP) },
        { translateX: interpolate(t.value, [0, 1], [0, 8], Extrapolation.CLAMP) },
        { scale: interpolate(t.value, [0, 1], [1, 1.05], Extrapolation.CLAMP) },
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

function ShimmerLabel() {
  const shimmer = useSharedValue(0);
  const reduceMotion = !!useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    shimmer.value = withRepeat(
      withDelay(2800, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) })),
      -1,
      false,
    );
  }, [reduceMotion, shimmer]);

  const shine = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 0
      : interpolate(shimmer.value, [0, 0.5, 1], [0, 0.5, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-48, 140], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.kickerWrap}>
      <Text style={styles.kickerUrban}>UrbanLens </Text>
      <Text style={styles.kickerAi}>AI</Text>
      <Animated.View pointerEvents="none" style={[styles.shimmer, shine]} />
    </View>
  );
}

type Props = {
  onOrbPress?: () => void;
};

export const AiHeroSection = memo(function AiHeroSection({ onOrbPress }: Props) {
  const reduceMotion = !!useReducedMotion();
  const [subIdx, setSubIdx] = useState(0);
  const [headlineIdx] = useState(() => Math.floor(Math.random() * HEADLINES.length));

  useEffect(() => {
    const id = setInterval(() => {
      setSubIdx((i) => (i + 1) % SUBTITLES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <MeshBlob
          color={CLOUD.primary}
          size={160}
          left="-8%"
          top={10}
          duration={9000}
          delay={0}
          reduceMotion={reduceMotion}
        />
        <MeshBlob
          color={CLOUD.aiAccent}
          size={140}
          left="62%"
          top={40}
          duration={10000}
          delay={1200}
          reduceMotion={reduceMotion}
        />
        <MeshBlob
          color={CLOUD.accent}
          size={110}
          left="28%"
          top={90}
          duration={8500}
          delay={2400}
          reduceMotion={reduceMotion}
        />
      </View>

      <Animated.View entering={FadeIn.duration(500)}>
        <ShimmerLabel />
      </Animated.View>

      <Animated.Text entering={FadeInUp.delay(120).duration(600)} style={styles.headline}>
        {HEADLINES[headlineIdx]}
      </Animated.Text>

      <Animated.Text key={subIdx} entering={FadeIn.duration(450)} style={styles.subtitle}>
        {SUBTITLES[subIdx]}
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(280).duration(650)} style={styles.orbSlot}>
        <AiThinkingOrb onPress={onOrbPress} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  hero: {
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  kickerWrap: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingVertical: 2,
  },
  kickerUrban: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: CLOUD.primary,
  },
  kickerAi: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: CLOUD.aiAccent,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 36,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  headline: {
    marginTop: 14,
    fontSize: 30,
    fontWeight: '800',
    color: CLOUD.ink,
    letterSpacing: -0.6,
    lineHeight: 36,
    maxWidth: 320,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: CLOUD.muted,
    fontWeight: '500',
  },
  orbSlot: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
});
