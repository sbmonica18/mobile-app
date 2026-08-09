import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type View as RNView,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SparkleWindow = { x: number; y: number };

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  focused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  embedded?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  /** Orbit / focus active — lift + stronger glow */
  orbitActive?: boolean;
  /** @deprecated use orbitActive */
  bloomActive?: boolean;
  /** Sparkle icon tapped — open orbit */
  onSparklePress?: () => void;
  /** Reports sparkle center in window coordinates */
  onSparkleWindow?: (point: SparkleWindow) => void;
  /** Clear text + reopen suggestions */
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const AiPromptComposer = memo(function AiPromptComposer({
  value,
  onChangeText,
  onSubmit,
  focused,
  onFocusChange,
  embedded = false,
  inputRef,
  orbitActive,
  bloomActive = false,
  onSparklePress,
  onSparkleWindow,
  onClear,
  style,
}: Props) {
  const active = orbitActive ?? bloomActive;
  const reduceMotion = !!useReducedMotion();
  const sparkleRef = useRef<RNView>(null);

  const focus = useSharedValue(focused || value.length > 0 ? 1 : 0);
  const glow = useSharedValue(active ? 1 : 0);
  const pulse = useSharedValue(0);

  const reportSparkle = useCallback(() => {
    sparkleRef.current?.measureInWindow((x, y, w, h) => {
      onSparkleWindow?.({ x: x + w / 2, y: y + h / 2 });
    });
  }, [onSparkleWindow]);

  useEffect(() => {
    focus.value = withTiming(focused || value.length > 0 ? 1 : 0, {
      duration: 220,
      easing: Easing.inOut(Easing.quad),
    });
  }, [focus, focused, value.length]);

  useEffect(() => {
    glow.value = withTiming(active ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, glow]);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.4;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  useEffect(() => {
    if (active) {
      requestAnimationFrame(reportSparkle);
    }
  }, [active, reportSparkle]);

  const cardStyle = useAnimatedStyle(() => {
    const a = Math.max(focus.value, glow.value);
    return {
      borderColor: interpolateColor(a, [0, 1], [CLOUD.border, CLOUD.primary]),
      transform: [
        {
          scale: interpolate(glow.value, [0, 1], [1, 1.015], Extrapolation.CLAMP),
        },
      ],
      shadowOpacity: interpolate(glow.value, [0, 1], [0.06, 0.16], Extrapolation.CLAMP),
      shadowRadius: interpolate(glow.value, [0, 1], [12, 22], Extrapolation.CLAMP),
    };
  });

  const sparkleGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.25, 0.7], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [1, 1.35], Extrapolation.CLAMP) },
    ],
  }));

  const sparkleIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [1, 1.06], Extrapolation.CLAMP) },
    ],
  }));

  const canSend = value.trim().length > 0;

  const handleSparklePress = () => {
    reportSparkle();
    onSparklePress?.();
    onFocusChange?.(true);
    inputRef?.current?.focus();
  };

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded, style]}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.topRow}>
          <View ref={sparkleRef} collapsable={false} onLayout={reportSparkle}>
            <Pressable
              style={styles.aiIcon}
              onPress={handleSparklePress}
              accessibilityRole="button"
              accessibilityLabel="Show suggestion ideas"
              hitSlop={6}
            >
              <Animated.View pointerEvents="none" style={[styles.aiIconPulse, sparkleGlowStyle]} />
              <Animated.View style={sparkleIconStyle}>
                <Ionicons name="sparkles" size={16} color={CLOUD.aiAccent} />
              </Animated.View>
            </Pressable>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Ask anything..."
            placeholderTextColor={CLOUD.muted}
            multiline
            maxLength={500}
            onSubmitEditing={onSubmit}
            returnKeyType="send"
            onFocus={() => {
              reportSparkle();
              onFocusChange?.(true);
            }}
            onBlur={() => onFocusChange?.(false)}
          />
          {value.length > 0 ? (
            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                reportSparkle();
                onClear?.();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear and show suggestions"
            >
              <Ionicons name="close-circle" size={22} color={CLOUD.muted} />
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.send, !canSend && styles.sendDisabled]}
            onPress={onSubmit}
            disabled={!canSend}
            accessibilityLabel="Send"
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: CLOUD.pad,
    paddingBottom: 10,
    backgroundColor: CLOUD.bg,
  },
  wrapEmbedded: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  aiIconPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: CLOUD.aiAccent,
  },
  input: {
    flex: 1,
    color: CLOUD.ink,
    fontSize: 16,
    minHeight: 28,
    maxHeight: 100,
    paddingTop: 4,
    paddingBottom: 4,
  },
  clearBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.35,
  },
});
