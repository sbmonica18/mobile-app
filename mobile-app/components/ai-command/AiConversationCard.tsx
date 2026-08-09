import { SimpleRichText } from '@/components/SimpleRichText';
import { CLOUD } from '@/constants/cloudTheme';
import type { AiPlannerResponse } from '@/services/aiApi';
import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ConfidenceMeter({ score }: { score: number }) {
  const progress = useSharedValue(0);
  const r = 28;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  const label = score >= 90 ? 'High confidence' : score >= 75 ? 'Strong match' : 'Good fit';

  return (
    <View style={styles.meter}>
      <View style={styles.meterRing}>
        <Svg width={68} height={68}>
          <Circle cx={34} cy={34} r={r} stroke={CLOUD.soft} strokeWidth={5} fill="none" />
          <AnimatedCircle
            cx={34}
            cy={34}
            r={r}
            stroke={CLOUD.primary}
            strokeWidth={5}
            fill="none"
            strokeDasharray={c}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin="34, 34"
          />
        </Svg>
        <Text style={styles.meterScore}>{score}%</Text>
      </View>
      <Text style={styles.meterLabel}>{label}</Text>
    </View>
  );
}

const FOLLOW_UPS = [
  'Find cheaper options',
  'Compare nearby destinations',
  'Show hidden places',
  'Reduce travel time',
  'Find family friendly options',
  'Best cafes nearby',
];

type Props = {
  prompt: string;
  suggestion: AiPlannerResponse;
  planMarkdown: string;
  exploring: boolean;
  onExplore: () => void;
  onSave?: () => void;
  onFollowUp: (text: string) => void;
  onReset: () => void;
};

export const AiConversationCard = memo(function AiConversationCard({
  prompt,
  suggestion,
  planMarkdown,
  exploring,
  onExplore,
  onSave,
  onFollowUp,
  onReset,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const score = suggestion.matchScore ?? 90;

  return (
    <View style={styles.wrap}>
      <Text style={styles.query}>&ldquo;{prompt}&rdquo;</Text>

      <Animated.View entering={FadeInUp.duration(450)} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={CLOUD.aiAccent} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Summary</Text>
              <Text style={styles.place}>{suggestion.placeName}</Text>
            </View>
          </View>
          <ConfidenceMeter score={score} />
        </View>

        <View style={styles.stats}>
          <Stat label="Weather" value={suggestion.weather || '—'} />
          <Stat label="Budget" value={suggestion.budget || '—'} />
          <Stat label="Distance" value={suggestion.distance || '—'} />
        </View>

        <Pressable onPress={() => setExpanded((e) => !e)} style={styles.reasonToggle}>
          <Text style={styles.reasonToggleText}>
            {expanded ? 'Hide reasoning' : 'Expand reasoning'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={CLOUD.primary}
          />
        </Pressable>

        {expanded ? (
          <View style={styles.reasoning}>
            <SimpleRichText text={planMarkdown} />
            {(suggestion.reasons || []).map((r) => (
              <View key={r} style={styles.reasonRow}>
                <Ionicons name="checkmark-circle" size={14} color={CLOUD.success} />
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.blurb} numberOfLines={3}>
            {suggestion.description}
          </Text>
        )}

        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryBtn, exploring && { opacity: 0.7 }]}
            onPress={onExplore}
            disabled={exploring}
          >
            {exploring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Navigate</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onSave}>
            <Ionicons name="bookmark-outline" size={16} color={CLOUD.primary} />
            <Text style={styles.secondaryBtnText}>Save</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={onReset}>
            <Text style={styles.ghostText}>New</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(180).duration(420)} style={styles.followSection}>
        <Text style={styles.followTitle}>You may also ask</Text>
        <View style={styles.followGrid}>
          {FOLLOW_UPS.map((item, i) => (
            <Animated.View key={item} entering={FadeInUp.delay(220 + i * 40).duration(360)}>
              <Pressable style={styles.followChip} onPress={() => onFollowUp(item)}>
                <Text style={styles.followChipText}>{item}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  query: {
    color: CLOUD.muted,
    fontSize: 15,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.hero,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  place: {
    color: CLOUD.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  meter: {
    alignItems: 'center',
  },
  meterRing: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterScore: {
    position: 'absolute',
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  meterLabel: {
    marginTop: 2,
    fontSize: 10,
    color: CLOUD.muted,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: CLOUD.soft,
    borderRadius: 14,
    padding: 10,
  },
  statLabel: {
    color: CLOUD.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: CLOUD.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  reasonToggle: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reasonToggleText: {
    color: CLOUD.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  reasoning: {
    marginTop: 10,
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonText: {
    color: CLOUD.body,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  blurb: {
    marginTop: 10,
    color: CLOUD.body,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.lightBlue,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    color: CLOUD.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  ghostBtn: {
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: CLOUD.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  followSection: {
    gap: 12,
  },
  followTitle: {
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 15,
  },
  followGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  followChip: {
    backgroundColor: CLOUD.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  followChipText: {
    color: CLOUD.body,
    fontSize: 13,
    fontWeight: '600',
  },
});
