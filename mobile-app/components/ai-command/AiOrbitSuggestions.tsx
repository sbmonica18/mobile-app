import { CLOUD } from '@/constants/cloudTheme';
import { VIBE_CHIPS, type VibeChip } from '@/mocks/vibeChips';
import * as Haptics from 'expo-haptics';
import { memo, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type View as RNView } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Window coordinates of the sparkle icon center */
export type OrbitOrigin = { x: number; y: number };

type Point = { x: number; y: number };

function OrbitChip({
  chip,
  index,
  open,
  sparkleWindow,
  reduceMotion,
  onPress,
}: {
  chip: VibeChip;
  index: number;
  open: boolean;
  sparkleWindow: OrbitOrigin | null;
  reduceMotion: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const slotRef = useRef<RNView>(null);
  const measuredForOpen = useRef(false);
  const [launch, setLaunch] = useState<Point | null>(null);
  const [size, setSize] = useState({ w: 100, h: 36 });

  // Measure rest position once per open — never mid-flight (translate would skew it)
  useEffect(() => {
    if (!open) {
      measuredForOpen.current = false;
      return;
    }
    if (!sparkleWindow || measuredForOpen.current) return;

    let cancelled = false;
    const run = () => {
      slotRef.current?.measureInWindow((cx, cy, cw, ch) => {
        if (cancelled || cw < 4 || ch < 4) return;
        measuredForOpen.current = true;
        setSize({ w: cw, h: ch });
        setLaunch({
          x: sparkleWindow.x - (cx + cw / 2),
          y: sparkleWindow.y - (cy + ch / 2),
        });
      });
    };
    // Double-rAF so flex-wrap layout has settled before measuring
    const t1 = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(t1);
    };
  }, [open, sparkleWindow]);

  useEffect(() => {
    if (!launch) return;

    if (open) {
      if (reduceMotion) {
        progress.value = withTiming(1, { duration: 180 });
        return;
      }
      progress.value = 0;
      progress.value = withDelay(
        index * 26,
        withSpring(1, { damping: 13, stiffness: 160, mass: 0.85 }),
      );
    } else {
      if (reduceMotion) {
        progress.value = withTiming(0, { duration: 140 });
        return;
      }
      progress.value = withDelay(
        index * 18,
        withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) }),
      );
    }
  }, [index, launch, open, progress, reduceMotion]);

  const dx = launch?.x ?? 0;
  const dy = launch?.y ?? 0;
  const dist = Math.hypot(dx, dy) || 1;
  const trailAngle = Math.atan2(dy, dx);
  const hasLaunch = launch != null;

  const chipStyle = useAnimatedStyle(() => {
    if (!hasLaunch) return { opacity: 0 };
    if (reduceMotion) {
      return {
        opacity: progress.value,
        transform: [
          { scale: pressScale.value * interpolate(progress.value, [0, 1], [0.96, 1]) },
        ],
      };
    }
    const p = progress.value;
    return {
      opacity: interpolate(p, [0, 0.1, 1], [0, 1, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(p, [0, 1], [dx, 0], Extrapolation.CLAMP) },
        { translateY: interpolate(p, [0, 1], [dy, 0], Extrapolation.CLAMP) },
        {
          scale:
            pressScale.value *
            interpolate(p, [0, 0.55, 1], [0.12, 1.08, 1], Extrapolation.CLAMP),
        },
      ],
      zIndex: Math.round(8 + (1 - p) * 24),
    };
  });

  const trailStyle = useAnimatedStyle(() => {
    if (reduceMotion || !hasLaunch) return { opacity: 0 };
    const p = progress.value;
    const mid = interpolate(p, [0, 0.35, 0.75, 1], [0, 0.7, 0.22, 0], Extrapolation.CLAMP);
    const trailLen = Math.min(52, dist * 0.4) * interpolate(p, [0, 0.4, 1], [0.25, 1, 0.15]);
    return {
      opacity: mid,
      width: trailLen,
      transform: [
        { translateX: interpolate(p, [0, 1], [dx, 0], Extrapolation.CLAMP) },
        { translateY: interpolate(p, [0, 1], [dy, 0], Extrapolation.CLAMP) },
        { translateX: size.w / 2 },
        { translateY: size.h / 2 - 2 },
        { rotate: `${trailAngle}rad` },
        { translateX: -4 },
      ],
    };
  });

  const ghostStyle = useAnimatedStyle(() => {
    if (reduceMotion || !hasLaunch) return { opacity: 0 };
    const p = progress.value;
    const gp = Math.max(0, p - 0.16);
    return {
      opacity: interpolate(p, [0.08, 0.38, 0.72], [0, 0.38, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(gp, [0, 1], [dx, 0], Extrapolation.CLAMP) },
        { translateY: interpolate(gp, [0, 1], [dy, 0], Extrapolation.CLAMP) },
        { translateX: size.w * 0.2 },
        { translateY: size.h * 0.15 },
        { scale: 0.5 },
      ],
    };
  });

  return (
    <View ref={slotRef} style={styles.chipSlot} collapsable={false}>
      <Animated.View pointerEvents="none" style={[styles.trail, trailStyle]} />
      <Animated.View pointerEvents="none" style={[styles.ghost, ghostStyle]}>
        <Text style={styles.emoji}>{chip.emoji}</Text>
      </Animated.View>
      <AnimatedPressable
        style={[styles.chip, chipStyle]}
        onPressIn={() => {
          pressScale.value = withTiming(0.96, { duration: 80 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        onPress={() => {
          void Haptics.selectionAsync();
          onPress();
        }}
      >
        <Text style={styles.emoji}>{chip.emoji}</Text>
        <Text style={styles.chipText}>{chip.label}</Text>
      </AnimatedPressable>
    </View>
  );
}

type Props = {
  open: boolean;
  onSelect: (prompt: string) => void;
  /** Sparkle icon center in window coordinates */
  sparkleWindow: OrbitOrigin | null;
};

/**
 * Chips burst from the search-bar sparkle into a settled wrap grid,
 * then retract to the sparkle on dismiss.
 */
export const AiOrbitSuggestions = memo(function AiOrbitSuggestions({
  open,
  onSelect,
  sparkleWindow,
}: Props) {
  const reduceMotion = !!useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const ripple = useSharedValue(0);
  const [rippleLocal, setRippleLocal] = useState<Point>({ x: 18, y: -40 });
  const areaRef = useRef<RNView>(null);

  useEffect(() => {
    if (!open || !sparkleWindow) return;
    areaRef.current?.measureInWindow((ax, ay) => {
      setRippleLocal({
        x: sparkleWindow.x - ax,
        y: sparkleWindow.y - ay,
      });
    });
  }, [open, sparkleWindow]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (!reduceMotion) {
        ripple.value = 0;
        ripple.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      }
    } else if (mounted) {
      const totalMs = reduceMotion ? 160 : 240 + VIBE_CHIPS.length * 18;
      const t = setTimeout(() => setMounted(false), totalMs);
      return () => clearTimeout(t);
    }
  }, [mounted, open, reduceMotion, ripple]);

  const rippleStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(ripple.value, [0, 0.3, 1], [0.5, 0.22, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: rippleLocal.x - 20 },
        { translateY: rippleLocal.y - 20 },
        { scale: interpolate(ripple.value, [0, 1], [0.3, 3.4], Extrapolation.CLAMP) },
      ],
    };
  });

  if (!mounted && !open) return null;

  return (
    <View
      ref={areaRef}
      style={styles.area}
      pointerEvents={open ? 'auto' : 'none'}
      collapsable={false}
    >
      {!reduceMotion ? (
        <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
      ) : null}

      <Text style={styles.title}>Try asking</Text>
      <View style={styles.wrap}>
        {VIBE_CHIPS.map((chip, i) => (
          <OrbitChip
            key={chip.id}
            chip={chip}
            index={i}
            open={open}
            sparkleWindow={sparkleWindow}
            reduceMotion={reduceMotion}
            onPress={() => onSelect(chip.prompt)}
          />
        ))}
      </View>
    </View>
  );
});

/** @deprecated Prefer AiOrbitSuggestions */
export const AiSuggestionBloomPanel = AiOrbitSuggestions;

const styles = StyleSheet.create({
  area: {
    marginTop: 10,
    overflow: 'visible',
  },
  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CLOUD.aiAccent,
    zIndex: 0,
  },
  title: {
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    overflow: 'visible',
  },
  chipSlot: {
    position: 'relative',
    overflow: 'visible',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CLOUD.card,
    borderWidth: 1,
    borderColor: CLOUD.lightBlue,
    ...CLOUD.shadows.search,
  },
  trail: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: CLOUD.aiAccent,
    left: 0,
    top: 0,
    zIndex: 0,
  },
  ghost: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  emoji: { fontSize: 13 },
  chipText: {
    color: CLOUD.ink,
    fontSize: 12,
    fontWeight: '600',
  },
});
