import { CLOUD } from '@/constants/cloudTheme';
import { priorityColor } from '@/services/intelligence';
import type { IntelligenceEvent } from '@/services/intelligence/intelligenceTypes';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = {
  event: IntelligenceEvent;
  index?: number;
  onAction?: (event: IntelligenceEvent) => void;
  onWhy?: (event: IntelligenceEvent) => void;
};

export function IntelligenceEventCard({ event, index = 0, onAction, onWhy }: Props) {
  const color = priorityColor(event.priority);
  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(420)} style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
          <Ionicons name={event.icon as keyof typeof Ionicons.glyphMap} size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>{event.type.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.priority}>{event.priority}</Text>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.body}>{event.description}</Text>
      <Text style={styles.impact}>{event.impact}</Text>
      <View style={styles.aiWash}>
        <Ionicons name="sparkles" size={14} color={CLOUD.aiAccent} />
        <Text style={styles.rec}>UrbanLens recommends: {event.recommendation}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.source}>
          {event.source === 'live' ? 'Live signal' : event.source === 'estimated' ? 'Estimated' : 'Partial'} ·{' '}
          {event.confidence}% confidence
        </Text>
      </View>
      <View style={styles.actions}>
        {onWhy ? (
          <Pressable onPress={() => onWhy(event)} style={styles.whyBtn}>
            <Text style={styles.whyText}>Why this?</Text>
          </Pressable>
        ) : null}
        {event.action !== 'NONE' && onAction ? (
          <Pressable onPress={() => onAction(event)} style={styles.cta}>
            <Text style={styles.ctaText}>{event.actionLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 20,
    gap: 10,
    ...CLOUD.shadows.card,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  priority: { fontSize: 11, fontWeight: '700', color: CLOUD.muted },
  title: { fontSize: 18, fontWeight: '800', color: CLOUD.ink },
  body: { fontSize: 14, lineHeight: 20, color: CLOUD.body },
  impact: { fontSize: 13, color: CLOUD.muted, fontStyle: 'italic' },
  aiWash: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.04)',
    borderRadius: 14,
    padding: 12,
  },
  rec: { flex: 1, fontSize: 13, lineHeight: 18, color: CLOUD.body, fontWeight: '600' },
  meta: { marginTop: 2 },
  source: { fontSize: 11, color: CLOUD.muted, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4, alignItems: 'center' },
  whyBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  whyText: { color: CLOUD.aiAccent, fontWeight: '800', fontSize: 13 },
  cta: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLOUD.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: CLOUD.radii.button,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
